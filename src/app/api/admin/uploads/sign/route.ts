import { NextResponse } from "next/server";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import {
  ALLOWED_IMAGE_FORMATS,
  cloudinaryConfig,
  signParams,
} from "@/lib/server/cloudinary";
import { rateLimit } from "@/lib/server/rate-limit";

const FOLDER = "ptsc/events";

// POST /api/admin/uploads/sign
// Gives the browser a short-lived signature to upload one image straight to
// Cloudinary. The file never passes through this server, and the signature only
// covers an image upload into our events folder.
export async function POST(request: Request) {
  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    const config = cloudinaryConfig();
    if (!config) {
      return NextResponse.json(
        {
          success: false,
          message: "Image uploads aren't set up yet. Paste an image link instead.",
        },
        { status: 503 }
      );
    }

    // Stops a signed-in account from minting signatures in a loop.
    const limited = await rateLimit(request, {
      name: "upload-sign",
      limit: 40,
      windowSeconds: 600,
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
