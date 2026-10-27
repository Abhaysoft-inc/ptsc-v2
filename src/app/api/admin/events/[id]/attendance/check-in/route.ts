import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import { badRequest, escapeRegex, isObjectId, notFound, readJson } from "@/lib/server/query";
import { toRegistrationRow } from "@/lib/server/registrations";
import { EventRegistration } from "@/models/EventRegistration";

type Context = { params: Promise<{ id: string }> };

const bodySchema = z.object({ code: z.string().trim().min(1).max(60) });

// POST /api/admin/events/:id/attendance/check-in { code }
// Desk check-in: marks a registration present right away, found by its
// registration ID or by the roll number of the registrant or any team member.
export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Event not found.");

  const parsed = bodySchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("Enter a registration ID or roll number.");

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    // Whole-value, case-insensitive match (e.g. "ptsc25e12" finds PTSC25E12).
    const exact = { $regex: `^${escapeRegex(parsed.data.code)}$`, $options: "i" };
    await connectDB();
    const matches = await EventRegistration.find(
      {
        eventId: id,
        deleted: { $ne: true },
        $or: [{ registrationId: exact }, { rollNo: exact }, { "participants.rollNo": exact }],
      },
      null,
      { limit: 2 }
    ).lean();

    if (matches.length === 0) {
      return notFound(`No registration matches "${parsed.data.code}" for this event.`);
    }
    if (matches.length > 1) {
      return NextResponse.json(
        {
          success: false,
          message: "More than one registration matches. Use the registration ID instead.",
        },
        { status: 409 }
      );
    }

    const reg = matches[0];
    const row = toRegistrationRow(reg);
    const who = row.teamName ?? row.lead.name;

    if (reg.attended) {
      return NextResponse.json({
        success: true,
        alreadyPresent: true,
        message: `${who} was already marked present.`,
        row,
      });
    }

    const attendedAt = new Date();
    await EventRegistration.updateOne(
      { _id: reg._id },
      { $set: { attended: true, attendedAt } }
    );

    return NextResponse.json({
      success: true,
      alreadyPresent: false,
      message: `${who} marked present.`,
      row: { ...row, attended: true, attendedAt: attendedAt.toISOString() },
    });
  } catch (error) {
    return serverError("Check-in failed", error);
  }
}
