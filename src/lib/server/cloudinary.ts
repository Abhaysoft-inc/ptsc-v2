import "server-only";
import { createHash } from "node:crypto";

/** Image types an upload may have. Cloudinary enforces this from the signed request. */
export const ALLOWED_IMAGE_FORMATS = "jpg,jpeg,png,webp,gif";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/** The account's credentials, or null when Cloudinary isn't set up. */
export function cloudinaryConfig(): CloudinaryConfig | null {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return null;
  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    apiSecret: CLOUDINARY_API_SECRET,
  };
}

/**
 * Cloudinary's signature: the parameters sorted by name and joined as
 * `name=value&name=value`, with the API secret added on the end, then SHA-1.
 * (Only the parameters being signed go in; `file` and `api_key` do not.)
 */
export function signParams(params: Record<string, string | number>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}
