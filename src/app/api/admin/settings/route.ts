import { NextResponse, connection } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin, serverError } from "@/lib/auth/require-admin";
import { noStore, parseBody } from "@/lib/server/query";
import { Setting } from "@/models/Setting";

// Same storage as the old site: { key: "allowSignup", value: boolean }.
// A missing setting means signups are open.
export async function GET() {
  await connection();

  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;

    await connectDB();
    const setting = await Setting.findOne({ key: "allowSignup" }).lean();
    return NextResponse.json(
      { success: true, allowSignup: setting ? Boolean(setting.value) : true },
      noStore
    );
  } catch (error) {
    return serverError("Reading settings failed", error);
  }
}

const patchSchema = z.object({ allowSignup: z.boolean() });

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;

    const body = await parseBody(request, patchSchema, "allowSignup must be true or false.");
    if ("response" in body) return body.response;

    await connectDB();
    await Setting.updateOne(
      { key: "allowSignup" },
      { $set: { value: body.data.allowSignup } },
      { upsert: true }
    );
    return NextResponse.json({ success: true, allowSignup: body.data.allowSignup });
  } catch (error) {
    return serverError("Updating settings failed", error);
  }
}
