import { api } from "@/lib/api-client";

export const MAX_IMAGE_MB = 5;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface SignResponse {
  cloudName: string;
  apiKey: string;
  folder: string;
  allowedFormats: string;
  timestamp: number;
  signature: string;
}

/**
 * Uploads an image to Cloudinary and returns its https link. Throws an Error
 * with a message that can be shown as is.
 */
export async function uploadImage(
  file: File,
  /** Who may upload: the staff signer by default, or e.g. the blog one for any signed-in user. */
  signEndpoint = "/api/admin/uploads/sign"
): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error("Choose a JPG, PNG, WebP or GIF image.");
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    throw new Error(`That image is over ${MAX_IMAGE_MB} MB. Choose a smaller one.`);
  }

  const sign = await api<SignResponse>(signEndpoint, { method: "POST" });

  // These must match what the server signed, or Cloudinary rejects the upload.
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", sign.apiKey);
  body.append("timestamp", String(sign.timestamp));
  body.append("signature", sign.signature);
  body.append("folder", sign.folder);
  body.append("allowed_formats", sign.allowedFormats);

  let res: Response;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
      method: "POST",
      body,
    });
  } catch {
    throw new Error("Couldn't reach the image service. Check your connection and try again.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || typeof data?.secure_url !== "string") {
    throw new Error(data?.error?.message ?? "The image couldn't be uploaded. Please try again.");
  }
  return data.secure_url;
}
