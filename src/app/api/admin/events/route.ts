import { NextResponse, connection } from "next/server";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import { noStore } from "@/lib/server/query";
import type { AdminEventSummary } from "@/lib/types/admin";
import { Event } from "@/models/Event";

// Events for the dashboard's event pickers, newest first.
export async function GET() {
  // Depends on the signed-in user, so never prerender. Must come before the
  // try/catch, which would otherwise swallow Next's prerender signal.
  await connection();

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    await connectDB();
    const docs = await Event.find({}, "title date status registrationType")
      .sort({ date: -1 })
      .lean();

    const events: AdminEventSummary[] = docs.map((e) => ({
      id: e._id.toString(),
      title: e.title,
      date: e.date ? new Date(e.date).toISOString() : null,
      status: e.status ?? "",
      registrationType: e.registrationType === "team" ? "team" : "individual",
    }));

    return NextResponse.json({ success: true, events }, noStore);
  } catch (error) {
    return serverError("Listing events failed", error);
  }
}
