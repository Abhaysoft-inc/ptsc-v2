import { NextResponse, connection } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireAdmin, requireStaff, serverError } from "@/lib/auth/require-admin";
import { noStore, notFound, badRequest, isObjectId, parseBody } from "@/lib/server/query";
import {
  EVENTS_TAG,
  countsByEvent,
  eventInputSchema,
  inputToDoc,
  isDuplicateKeyError,
  toAdminEvent,
  uniqueSlug,
} from "@/lib/server/events";
import { Event } from "@/models/Event";
import { EventRegistration } from "@/models/EventRegistration";

type Context = { params: Promise<{ id: string }> };

// GET /api/admin/events/:id — the full event, for the edit form.
export async function GET(_request: Request, { params }: Context) {
  await connection();
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Event not found.");

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    await connectDB();
    const event = await Event.findById(id).lean();
    if (!event) return notFound("Event not found.");

    const counts = await countsByEvent([event._id]);
    return NextResponse.json(
      { success: true, event: toAdminEvent(event, counts.get(id)) },
      noStore
    );
  } catch (error) {
    return serverError("Reading event failed", error);
  }
}

// PATCH /api/admin/events/:id — save the edit form (same body as create).
// The public link (slug) stays the same, so links already shared keep working.
export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Event not found.");

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    const body = await parseBody(request, eventInputSchema, "Please fix the highlighted fields.");
    if ("response" in body) return body.response;

    await connectDB();
    const existing = await Event.findById(id, "slug").lean();
    if (!existing) return notFound("Event not found.");

    const update = {
      ...inputToDoc(body.data),
      // Events imported from the old site always have a slug; this covers the
      // odd one that doesn't.
      ...(existing.slug ? {} : { slug: await uniqueSlug(body.data.title, id) }),
      updatedBy: auth.user.id,
    };
    // Fields the form left empty are removed rather than stored as undefined.
    const unset = Object.fromEntries(
      Object.entries(update).filter(([, v]) => v === undefined).map(([k]) => [k, ""])
    );
    const set = Object.fromEntries(Object.entries(update).filter(([, v]) => v !== undefined));

    const event = await Event.findByIdAndUpdate(
      id,
      Object.keys(unset).length ? { $set: set, $unset: unset } : { $set: set },
      { returnDocument: "after", runValidators: true }
    ).lean();
    if (!event) return notFound("Event not found.");

    revalidateTag(EVENTS_TAG, { expire: 0 });

    const counts = await countsByEvent([event._id]);
    return NextResponse.json({
      success: true,
      message: "Event saved.",
      event: toAdminEvent(event, counts.get(id)),
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return badRequest("An event with this title already exists.", {
        title: "This title is already used.",
      });
    }
    return serverError("Saving event failed", error);
  }
}

// DELETE /api/admin/events/:id — admins only. An event that has registrations
// can't be deleted (that would orphan them); unpublish it instead.
export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Event not found.");

  try {
    const auth = await requireAdmin();
    if ("response" in auth) return auth.response;

    await connectDB();
    const registrations = await EventRegistration.countDocuments({ eventId: id });
    if (registrations > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `This event has ${registrations} registration${registrations === 1 ? "" : "s"}, so it can't be deleted. Edit it and untick "Publish on website" to hide it instead.`,
        },
        { status: 409 }
      );
    }

    const result = await Event.deleteOne({ _id: id });
    if (result.deletedCount === 0) return notFound("Event not found.");

    revalidateTag(EVENTS_TAG, { expire: 0 });
    return NextResponse.json({ success: true, message: "Event deleted." });
  } catch (error) {
    return serverError("Deleting event failed", error);
  }
}
