import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Event, type EventDoc } from "@/models/Event";
import type { PublicEvent } from "@/lib/events";
import {
  EVENTS_TAG,
  countsByEvent,
  dayParts,
  deriveStatus,
  eventDay,
  registrationOpen,
  toFormField,
} from "@/lib/server/events";
import { isObjectId } from "@/lib/server/query";

type EventRecord = EventDoc & { _id: Types.ObjectId };

function toPublicEvent(e: EventRecord, registered: number, now: Date): PublicEvent {
  const { month, day, year } = dayParts(eventDay(e.date));
  const capacity = e.capacity ?? 0;
  return {
    id: e.slug || e._id.toString(),
    tag: e.category || "Event",
    month,
    day,
    year,
    title: e.title,
    description: e.description,
    longDescription: e.description,
    image: e.coverImageUrl || "/bg.jpg",
    locationTitle: e.venue || "Venue to be announced",
    locationSubtitle: "",
    time: e.time || "Time to be announced",
    attendees: registered,
    spotsLeft: capacity > 0 ? Math.max(0, capacity - registered) : undefined,
    status: deriveStatus(e, now) === "Completed" ? "past" : "upcoming",
    whatsappLink: e.whatsappGroupLink || undefined,
    rulebookUrl: e.ruleBookUrl || undefined,
    resources: (e.resources ?? []).map((r) => ({ label: r.label, url: r.url })),
    registrationOpen: registrationOpen(e, now),
    registration: {
      type: e.registrationType === "team" ? "team" : "individual",
      teamMinSize: e.teamMinSize ?? 1,
      teamMaxSize: e.teamMaxSize ?? 1,
      useCustomForm: Boolean(e.useCustomForm),
      googleFormLink: e.googleFormLink ?? "",
      forceGoogleForm: Boolean(e.forceGoogleForm),
      fields: (e.registrationFields ?? []).map((f, i) => toFormField(f, i, "f")),
      participantFields: (e.participantFields ?? []).map((f, i) => toFormField(f, i, "p")),
    },
  };
}

/**
 * Published events for the website: upcoming ones first (soonest first), then
 * past ones (most recent first). Cached, and refreshed whenever an admin
 * changes an event (the "events" tag).
 */
export async function getPublicEvents(): Promise<PublicEvent[]> {
  "use cache";
  cacheTag(EVENTS_TAG);
  cacheLife("minutes");

  await connectDB();
  const docs = await Event.find({ published: { $ne: false } }).sort({ date: -1 }).lean();
  const counts = await countsByEvent(docs.map((d) => d._id));
  const now = new Date();
  const events = docs.map((d) =>
    toPublicEvent(d, counts.get(d._id.toString())?.registered ?? 0, now)
  );

  const upcoming = events.filter((e) => e.status !== "past").reverse();
  const past = events.filter((e) => e.status === "past");
  return [...upcoming, ...past];
}

/** One published event by its slug (or id). */
export async function getPublicEvent(idOrSlug: string): Promise<PublicEvent | null> {
  "use cache";
  cacheTag(EVENTS_TAG);
  cacheLife("minutes");

  await connectDB();
  const doc = await Event.findOne({
    published: { $ne: false },
    $or: [{ slug: idOrSlug }, ...(isObjectId(idOrSlug) ? [{ _id: idOrSlug }] : [])],
  }).lean();
  if (!doc) return null;

  const counts = await countsByEvent([doc._id]);
  return toPublicEvent(doc, counts.get(doc._id.toString())?.registered ?? 0, new Date());
}

/**
 * Like getPublicEvents, but a database failure gives an empty list instead of
 * breaking the page. (Failures aren't cached, so the next visit retries.)
 */
export async function getPublicEventsSafe(): Promise<PublicEvent[]> {
  try {
    return await getPublicEvents();
  } catch (error) {
    console.error("Loading public events failed:", error);
    return [];
  }
}
