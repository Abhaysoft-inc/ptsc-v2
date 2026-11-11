import { NextResponse, connection, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireRole, requireStaff, serverError } from "@/lib/auth/require-admin";
import { badRequest, noStore, parseBody } from "@/lib/server/query";
import {
  EVENTS_TAG,
  countsByEvent,
  eventInputSchema,
  inputToDoc,
  isDuplicateKeyError,
  toAdminEvent,
  uniqueSlug,
} from "@/lib/server/events";
import type { AdminEventSummary } from "@/lib/types/admin";
import { Event } from "@/models/Event";

// GET /api/admin/events
//   default      staff: a light list for the dashboard's event pickers
//   ?view=full   any signed-in member: full events for the Events tab, with
//                registration counts. Drafts are hidden from `normal` users.
export async function GET(request: NextRequest) {
  // Depends on the signed-in user, so never prerender. Must come before the
  // try/catch, which would otherwise swallow Next's prerender signal.
  await connection();

  try {
    const full = request.nextUrl.searchParams.get("view") === "full";
    const auth = full
      ? await requireRole(["admin", "member", "normal"])
      : await requireStaff();
    if ("response" in auth) return auth.response;

    await connectDB();

    if (!full) {
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
    }

    const filter = auth.user.role === "normal" ? { published: { $ne: false } } : {};
    const docs = await Event.find(filter).sort({ date: -1 }).lean();
    const counts = await countsByEvent(docs.map((e) => e._id));
    const now = new Date();
    return NextResponse.json(
      {
        success: true,
        events: docs.map((e) => toAdminEvent(e, counts.get(e._id.toString()), now)),
      },
      noStore
    );
  } catch (error) {
    return serverError("Listing events failed", error);
  }
}

// POST /api/admin/events — create an event (the Create Event form).
export async function POST(request: Request) {
  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    const body = await parseBody(request, eventInputSchema, "Please fix the highlighted fields.");
    if ("response" in body) return body.response;

    await connectDB();
    const event = await Event.create({
      ...inputToDoc(body.data),
      slug: await uniqueSlug(body.data.title),
      createdBy: auth.user.id,
      updatedBy: auth.user.id,
    });

    // Public pages cache event data under this tag; expire it so the new event
    // shows up right away.
    revalidateTag(EVENTS_TAG, { expire: 0 });

    return NextResponse.json(
      { success: true, message: "Event created.", event: toAdminEvent(event.toObject()) },
      { status: 201 }
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const field = Object.keys(error.keyPattern ?? {})[0];
      return badRequest(
        field === "title"
          ? "An event with this title already exists."
          : "An event with this link already exists. Try a different title.",
        field === "title" ? { title: "This title is already used." } : undefined
      );
    }
    return serverError("Creating event failed", error);
  }
}
