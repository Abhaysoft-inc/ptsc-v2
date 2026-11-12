import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { PipelineStage, Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Event, type EventDoc } from "@/models/Event";
import type { EventData, PublicEvent } from "@/lib/events";
import {
  EVENTS_TAG,
  dayParts,
  deriveStatus,
  eventDay,
  registrationOpen,
  todayStart,
  toFormField,
} from "@/lib/server/events";
import { isObjectId } from "@/lib/server/query";

type EventRecord = EventDoc & { _id: Types.ObjectId };

/** Joins the number of live registrations onto each event, in the same query. */
const registeredLookup: PipelineStage = {
  $lookup: {
    from: "eventregistrations",
    localField: "_id",
    foreignField: "eventId",
    pipeline: [
      { $match: { deleted: { $ne: true } } },
      { $group: { _id: null, registered: { $sum: 1 } } },
    ],
    as: "counts",
  },
};

// ------------------------------------------------------------ one event ----

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

/** One published event by its slug (or id), with its full registration form. */
export async function getPublicEvent(idOrSlug: string): Promise<PublicEvent | null> {
  "use cache";
  cacheTag(EVENTS_TAG);
  cacheLife("minutes");

  await connectDB();
  // The event and its registration count come back in one query.
  const [doc] = await Event.aggregate<EventRecord & { counts: { registered: number }[] }>([
    {
      $match: {
        published: { $ne: false },
        $or: [{ slug: idOrSlug }, ...(isObjectId(idOrSlug) ? [{ _id: idOrSlug }] : [])],
      },
    },
    { $limit: 1 },
    registeredLookup,
  ]);
  if (!doc) return null;

  return toPublicEvent(doc, doc.counts[0]?.registered ?? 0, new Date());
}

// ----------------------------------------------------------- event lists ----

/** One page of event cards for the website. */
export interface PublicEventPage {
  events: EventData[];
  page: number;
  totalPages: number;
  total: number;
}

interface CardRow {
  _id: Types.ObjectId;
  slug?: string;
  title: string;
  description: string;
  date: Date;
  time?: string;
  venue?: string;
  category?: string;
  capacity?: number;
  completed?: boolean;
  coverImageUrl?: string;
  whatsappGroupLink?: string;
  ruleBookUrl?: string;
  counts: { registered: number }[];
}

function toPublicCard(row: CardRow, now: Date): EventData {
  const { month, day, year } = dayParts(eventDay(row.date));
  const registered = row.counts[0]?.registered ?? 0;
  const capacity = row.capacity ?? 0;
  return {
    id: row.slug || row._id.toString(),
    tag: row.category || "Event",
    month,
    day,
    year,
    title: row.title,
    description: row.description,
    image: row.coverImageUrl || "/bg.jpg",
    locationTitle: row.venue || "Venue to be announced",
    locationSubtitle: "",
    time: row.time || "Time to be announced",
    attendees: registered,
    spotsLeft: capacity > 0 ? Math.max(0, capacity - registered) : undefined,
    status: deriveStatus(row, now) === "Completed" ? "past" : "upcoming",
    whatsappLink: row.whatsappGroupLink || undefined,
    rulebookUrl: row.ruleBookUrl || undefined,
  };
}

/**
 * One page of published events for the website's lists: upcoming ones first
 * (soonest first), then past ones (most recent first). Each card carries only what
 * a card shows, not the registration form. The registration counts are joined in
 * the same query, and the result is cached and refreshed whenever an admin changes
 * an event (the "events" tag).
 */
export async function getPublicEventCards(page = 1, pageSize = 12): Promise<PublicEventPage> {
  "use cache";
  cacheTag(EVENTS_TAG);
  cacheLife("minutes");

  await connectDB();
  const now = new Date();
  const today = todayStart(now);
  const match = { published: { $ne: false } };
  const wanted = Math.max(1, page);

  const fetchPage = (skip: number) =>
    Event.aggregate<CardRow>([
      { $match: match },
      // Upcoming first, soonest to latest; then past, latest to earliest.
      { $addFields: { past: { $or: [{ $eq: ["$completed", true] }, { $lt: ["$date", today] }] } } },
      {
        $addFields: {
          order: {
            $cond: ["$past", { $multiply: [-1, { $toLong: "$date" }] }, { $toLong: "$date" }],
          },
        },
      },
      { $sort: { past: 1, order: 1, _id: 1 } },
      { $skip: skip },
      { $limit: pageSize },
      registeredLookup,
      {
        $project: {
          slug: 1,
          title: 1,
          date: 1,
          time: 1,
          venue: 1,
          category: 1,
          capacity: 1,
          completed: 1,
          coverImageUrl: 1,
          whatsappGroupLink: 1,
          ruleBookUrl: 1,
          // Cards show a few lines; no need to send up to 5,000 characters each.
          description: { $substrCP: ["$description", 0, 300] },
          counts: 1,
        },
      },
    ]);

  // The count and the page are asked for together. A page past the end is pulled
  // back to the last one.
  const [total, firstTry] = await Promise.all([
    Event.countDocuments(match),
    fetchPage((wanted - 1) * pageSize),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(wanted, totalPages);
  const rows = current === wanted ? firstTry : await fetchPage((current - 1) * pageSize);

  return { events: rows.map((row) => toPublicCard(row, now)), page: current, totalPages, total };
}

/**
 * Like getPublicEventCards, but a database failure gives an empty page instead of an
 * error page. (Failures aren't cached, so the next visit retries.)
 */
export async function getPublicEventCardsSafe(page = 1, pageSize = 12): Promise<PublicEventPage> {
  try {
    return await getPublicEventCards(page, pageSize);
  } catch (error) {
    console.error("Loading public events failed:", error);
    return { events: [], page: 1, totalPages: 1, total: 0 };
  }
}

/** The address and date of every published event, for the sitemap. */
export async function getEventSitemapEntries(): Promise<{ id: string; date: string }[]> {
  "use cache";
  cacheTag(EVENTS_TAG);
  cacheLife("minutes");

  await connectDB();
  const rows = await Event.find({ published: { $ne: false } }, { slug: 1, date: 1 })
    .sort({ date: -1 })
    .limit(1000)
    .lean();
  return rows.map((e) => ({ id: e.slug || e._id.toString(), date: new Date(e.date).toISOString() }));
}
