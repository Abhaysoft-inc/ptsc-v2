import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import { badRequest, isObjectId, notFound, readJson } from "@/lib/server/query";
import { EventRegistration } from "@/models/EventRegistration";

type Context = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  updates: z
    .array(
      z.object({
        id: z.string().refine(isObjectId, "Invalid registration id"),
        attended: z.boolean(),
      })
    )
    .min(1, "Nothing to save.")
    .max(1000, "Too many changes at once."),
});

// PATCH /api/admin/events/:id/attendance
// { updates: [{ id, attended }] } — saves present/absent for registrations of
// this event. attendedAt is set when marked present and cleared when absent.
export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Event not found.");

  const parsed = bodySchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid changes.");
  }

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    await connectDB();
    const now = new Date();
    const result = await EventRegistration.bulkWrite(
      parsed.data.updates.map((u) => ({
        updateOne: {
          // Scoped to the event so an id from another event can't be changed.
          filter: { _id: u.id, eventId: id, deleted: { $ne: true } },
          update: {
            $set: { attended: u.attended, attendedAt: u.attended ? now : null },
          },
        },
      }))
    );

    return NextResponse.json({
      success: true,
      saved: result.matchedCount,
      // Rows that were deleted or belong to another event are skipped.
      skipped: parsed.data.updates.length - result.matchedCount,
    });
  } catch (error) {
    return serverError("Saving attendance failed", error);
  }
}
