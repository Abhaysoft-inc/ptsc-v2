import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin, serverError } from "@/lib/auth/require-admin";
import { badRequest, isObjectId, notFound, readJson } from "@/lib/server/query";
import { EventRegistration } from "@/models/EventRegistration";

type Context = { params: Promise<{ id: string }> };

// Admins only, as on the old site: members can view registrations but not
// trash or restore them.

// DELETE: move to trash (soft delete; nothing is removed).
export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Registration not found.");

  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;

    await connectDB();
    const result = await EventRegistration.updateOne(
      { _id: id, deleted: { $ne: true } },
      { $set: { deleted: true, deletedAt: new Date() } }
    );
    if (result.matchedCount === 0) return notFound("Registration not found.");
    return NextResponse.json({ success: true, message: "Moved to trash." });
  } catch (error) {
    return serverError("Deleting registration failed", error);
  }
}

const patchSchema = z.object({ action: z.literal("restore") });

// PATCH { action: "restore" }: bring back from the trash.
export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Registration not found.");
  if (!patchSchema.safeParse(await readJson(request)).success) {
    return badRequest('Expected { "action": "restore" }.');
  }

  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;

    await connectDB();
    const result = await EventRegistration.updateOne(
      { _id: id, deleted: true },
      { $set: { deleted: false, deletedAt: null } }
    );
    if (result.matchedCount === 0) return notFound("Registration not in trash.");
    return NextResponse.json({ success: true, message: "Restored." });
  } catch (error) {
    return serverError("Restoring registration failed", error);
  }
}
