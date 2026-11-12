"use client";
/* eslint-disable jsx-a11y/alt-text -- `alt` is a required ImageProps field, passed through the spread */

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";
import { isCloudinary } from "@/lib/images";

// Cloudinary images are asked for from Cloudinary's own CDN, already resized and in the
// best format the visitor's browser supports (f_auto: AVIF/WebP/JPEG, q_auto: quality
// picked per image, c_limit: never enlarged). Browsers and the CDN cache them for a
// long time and nothing passes through our server, so a 5 MB upload arrives as a
// ~50-200 KB image.
const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

// Cloudinary's free plan counts every different resized version of an image as a
// transformation (25 credits a month; 1,000 transformations = 1 credit). next/image asks
// for up to 16 widths per picture, so ask for only these three instead: a given image
// then costs at most a handful of transformations, ever, however many people view it.
const WIDTHS = [640, 1080, 1920];

function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  const match = CLOUDINARY_UPLOAD.exec(src);
  if (!match) return src;
  const w = WIDTHS.find((candidate) => candidate >= width) ?? WIDTHS[WIDTHS.length - 1];
  return `${match[1]}f_auto,q_${quality ?? "auto"},w_${w},c_limit/${match[2]}`;
}

/**
 * next/image with the right behaviour for where the picture lives:
 *  - Cloudinary: resized by Cloudinary's CDN (above)
 *  - our own files: resized and cached by Next, as usual
 *  - a link to any other website: shown as it is, since Next only resizes hosts it knows
 */
export default function CloudImage(props: ImageProps) {
  const { src } = props;
  if (typeof src !== "string") return <Image {...props} />;
  if (isCloudinary(src)) return <Image {...props} loader={cloudinaryLoader} />;
  if (/^https?:\/\//.test(src)) return <Image {...props} unoptimized />;
  return <Image {...props} />;
}
