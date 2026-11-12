import { NextResponse } from "next/server";
import { requireRole, serverError } from "@/lib/auth/require-admin";
import {
  ALLOWED_IMAGE_FORMATS,
  cloudinaryConfig,
  signParams,
} from "@/lib/server/cloudinary";
import { rateLimit } from "@/lib/server/rate-limit";

const FOLDER = "ptsc/blogs";

// POST /api/blogs/uploads/sign
// Like the admin upload signer, but for anyone signed in, since anyone can write a
// post. The signature only covers an image upload into the blogs folder, it expires
// in a few minutes, and each account gets a limited number of them.
export async function POST(request: Request) {
  try {
    const auth = await requireRole(["admin", "member", "normal"]);
    if ("response" in auth) return auth.response;

    const config = cloudinaryConfig();
    if (!config) {
      return NextResponse.json(
        { success: false, message: "Image uploads aren't set up yet. Paste an image link instead." },
        { status: 503 }
      );
    }

    const limited = await rateLimit(request, {
      name: "blog-upload-sign",
      limit: 20,
      windowSeconds: 60 * 60,
      by: auth.user.id,
    });
    if (limited) return limited;

    const timestamp = Math.floor(Date.now() / 1000);
    const signed = { allowed_formats: ALLOWED_IMAGE_FORMATS, folder: FOLDER, timestamp };

    return NextResponse.json({
      success: true,
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      folder: FOLDER,
      allowedFormats: ALLOWED_IMAGE_FORMATS,
      timestamp,
      signature: signParams(signed, config.apiSecret),
    });
  } catch (error) {
    return serverError("Signing upload failed", error);
  }
}
