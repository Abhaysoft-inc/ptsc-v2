import "server-only";
import { z } from "zod";
import type { PipelineStage, Types } from "mongoose";
import { Event, type EventDoc } from "@/models/Event";
import { EventRegistration } from "@/models/EventRegistration";
import type {
  AdminEvent,
  EventInput,
  RegistrationField,
} from "@/lib/types/admin";

/** Cache tag shared by every cached read of public event data. */
export const EVENTS_TAG = "events";

type EventRecord = EventDoc & { _id: Types.ObjectId };

// ---------------------------------------------------------------- dates ----

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** "2026-01-25" for an event's stored date (midnight UTC of its calendar day). */
export function eventDay(date: Date | null | undefined) {
  return date ? new Date(date).toISOString().slice(0, 10) : "";
}

/** Today's calendar day in India, where the club is, as "YYYY-MM-DD". */
export function todayIST(now = new Date()) {
  return new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export function dayParts(day: string): AdminEvent["date"] {
  const [year = "", month = "1", dayOfMonth = ""] = day.split("-");
  return { month: MONTHS[Number(month) - 1] ?? "", day: dayOfMonth, year };
}

/** The fields that decide an event's status and whether registration is open. */
type EventTimeFields = { published?: boolean | null; completed?: boolean | null; date: Date };

export function deriveStatus(
  e: EventTimeFields,
  now = new Date()
): AdminEvent["status"] {
  if (e.published === false) return "Draft";
  if (e.completed) return "Completed";
  const day = eventDay(e.date);
  const today = todayIST(now);
  if (day < today) return "Completed";
  return day === today ? "Active" : "Upcoming";
}

/**
 * Registration stays open through the event day, then closes. (The old site
 * closed it at the start of the day itself.)
 */
export function registrationOpen(
  e: EventTimeFields,
  now = new Date()
) {
  if (e.published === false || e.completed) return false;
  return eventDay(e.date) >= todayIST(now);
}

// ---------------------------------------------------------------- slugs ----

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "event";
  let candidate = base;
  for (let n = 2; n < 500; n++) {
    const taken = await Event.exists(
      excludeId ? { slug: candidate, _id: { $ne: excludeId } } : { slug: candidate }
    );
    if (!taken) return candidate;
    candidate = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

// ----------------------------------------------------------- validation ----

export const text = (max: number) => z.string().trim().max(max);

/** An http(s) URL, or "" / missing for none. */
export const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Enter a full http(s) link.")
  .optional();

const regexSource = z
  .string()
  .max(300)
  .refine((v) => {
    try {
      new RegExp(v);
      return true;
    } catch {
      return false;
    }
  }, "Not a valid pattern.");

const fieldSchema = z.object({
  id: z.string().max(100).default(""),
  name: text(60).min(1, "Every field needs a name."),
  label: text(120).min(1, "Every field needs a label."),
  type: z.enum(["text", "email", "number", "tel", "url", "textarea", "select", "checkbox", "file"]),
  required: z.boolean(),
  placeholder: text(200).default(""),
  description: text(500).default(""),
  validation: regexSource.default(""),
  options: z.array(text(120)).max(50).default([]),
  allowedTypes: z.array(text(20)).max(20).default([]),
  maxSizeMB: z.number().min(1).max(50).default(10),
});

export const eventInputSchema = z
  .object({
    title: text(150).min(1, "Event title is required."),
    description: text(5000).min(1, "Event description is required."),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "A valid event date is required.")
      .refine((v) => !Number.isNaN(Date.parse(`${v}T00:00:00Z`)), "A valid event date is required."),
    time: text(60).default(""),
    venue: text(150).default(""),
    category: text(50).default(""),
    capacity: z.number().int().min(0).max(100_000).default(0),
    published: z.boolean().default(true),
    coverImageUrl: optionalUrl,
    ruleBookUrl: optionalUrl,
    whatsappGroupLink: optionalUrl,
    resources: z
      .array(z.object({ label: text(100).min(1), url: optionalUrl.pipe(z.string().min(1)) }))
      .max(20)
      .default([]),
    registration: z.object({
      type: z.enum(["individual", "team"]),
      teamMinSize: z.number().int().min(1).max(50),
      teamMaxSize: z.number().int().min(1).max(50),
      useCustomForm: z.boolean(),
      googleFormLink: optionalUrl.default(""),
      forceGoogleForm: z.boolean(),
      fields: z.array(fieldSchema).max(60),
      participantFields: z.array(fieldSchema).max(60),
    }),
  })
  .superRefine((value, ctx) => {
    const reg = value.registration;
    if (reg.type === "team" && reg.teamMaxSize < reg.teamMinSize) {
      ctx.addIssue({
        code: "custom",
        path: ["registration"],
        message: "Team size must have min ≥ 1 and max ≥ min.",
      });
    }
    if ((!reg.useCustomForm || reg.forceGoogleForm) && !reg.googleFormLink) {
      ctx.addIssue({
        code: "custom",
        path: ["registration"],
        message: "Provide a Google Form link, or use the custom form.",
      });
    }
  }) satisfies z.ZodType<EventInput, unknown>;

// -------------------------------------------------------------- mapping ----

const clean = (list: RegistrationField[]) =>
  list.map(({ id: _id, ...field }) => {
    void _id;
    return field;
  });

/** Form input → the fields stored on an Event document. */
export function inputToDoc(input: z.output<typeof eventInputSchema>) {
  const reg = input.registration;
  const team = reg.type === "team";
  return {
    title: input.title,
    description: input.description,
    date: new Date(`${input.date}T00:00:00.000Z`),
    time: input.time,
    venue: input.venue,
    category: input.category,
    capacity: input.capacity,
    published: input.published,
    coverImageUrl: input.coverImageUrl || undefined,
    ruleBookUrl: input.ruleBookUrl || undefined,
    whatsappGroupLink: input.whatsappGroupLink || undefined,
    resources: input.resources,
    registrationType: reg.type,
    teamMinSize: team ? reg.teamMinSize : 1,
    teamMaxSize: team ? reg.teamMaxSize : 1,
    useCustomForm: reg.useCustomForm,
    googleFormLink: reg.googleFormLink || undefined,
    forceGoogleForm: reg.forceGoogleForm,
    registrationFields: reg.useCustomForm ? clean(reg.fields) : [],
    participantFields: reg.useCustomForm && team ? clean(reg.participantFields) : [],
  };
}

type StoredField = NonNullable<EventDoc["registrationFields"]>[number];

/** Stored field → dashboard field. Old documents have no `id`, so one is made. */
export function toFormField(f: StoredField, index: number, prefix: string): RegistrationField {
  return {
    id: `${prefix}-${index}`,
    name: f.name,
    label: f.label,
    type: (f.type || "text") as RegistrationField["type"],
    required: Boolean(f.required),
    placeholder: f.placeholder ?? "",
    description: f.description ?? "",
    validation: f.validation ?? "",
    options: f.options ?? [],
    allowedTypes: f.allowedTypes ?? [],
    maxSizeMB: f.maxSizeMB ?? 10,
  };
}

export interface EventCounts {
  registered: number;
  attended: number;
}

export function toAdminEvent(e: EventRecord, counts?: EventCounts, now = new Date()): AdminEvent {
  return {
    id: e._id.toString(),
    title: e.title,
    date: dayParts(eventDay(e.date)),
    time: e.time ?? "",
    venue: e.venue ?? "",
    category: e.category ?? "",
    status: deriveStatus(e, now),
    capacity: e.capacity ?? 0,
    registeredCount: counts?.registered ?? 0,
    attendedCount: counts?.attended ?? 0,
    description: e.description,
    published: e.published !== false,
    coverImageUrl: e.coverImageUrl || undefined,
    ruleBookUrl: e.ruleBookUrl || undefined,
    whatsappGroupLink: e.whatsappGroupLink || undefined,
    resources: (e.resources ?? []).map((r) => ({ label: r.label, url: r.url })),
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

// ---------------------------------------------------------- list queries ----
// The Events tab and the public events list ask the database for one page at a
// time, with the registration counts joined in the same query, and only the
// fields a card needs. (The full event, with its form questions, is loaded one
// at a time when you open it.)

export const EVENT_STATUSES = ["Active", "Upcoming", "Completed", "Draft"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

/** midnight UTC of today's calendar day in India: what an event's `date` is compared against. */
export function todayStart(now = new Date()) {
  return new Date(`${todayIST(now)}T00:00:00.000Z`);
}

/** The database condition equivalent to deriveStatus() returning this status. */
export function statusCondition(status: EventStatus, now = new Date()) {
  const today = todayStart(now);
  const tomorrow = new Date(today.getTime() + DAY_MS);
  const live = { published: { $ne: false }, completed: { $ne: true } };
  switch (status) {
    case "Draft":
      return { published: false };
    case "Completed":
      return { published: { $ne: false }, $or: [{ completed: true }, { date: { $lt: today } }] };
    case "Active":
      return { ...live, date: { $gte: today, $lt: tomorrow } };
    case "Upcoming":
      return { ...live, date: { $gte: tomorrow } };
  }
}

/** Counts of live registrations per event, joined in the same query (needs MongoDB 5+). */
const countsLookup = {
  $lookup: {
    from: "eventregistrations",
    localField: "_id",
    foreignField: "eventId",
    pipeline: [
      { $match: { deleted: { $ne: true } } },
      { $group: { _id: null, registered: { $sum: 1 }, attended: { $sum: { $cond: ["$attended", 1, 0] } } } },
    ],
    as: "counts",
  },
};

export interface EventListRow {
  _id: Types.ObjectId;
  title: string;
  date: Date;
  time?: string;
  venue?: string;
  category?: string;
  capacity?: number;
  published?: boolean;
  completed?: boolean;
  coverImageUrl?: string;
  description: string;
  counts: { registered: number; attended: number }[];
}

/** One page of events for the dashboard: newest first, trimmed to what a card shows. */
export function adminListPipeline(
  match: Record<string, unknown>,
  skip: number,
  limit: number
): PipelineStage[] {
  return [
    { $match: match },
    { $sort: { date: -1, _id: -1 } },
    { $skip: skip },
    { $limit: limit },
    countsLookup as PipelineStage,
    {
      $project: {
        title: 1,
        date: 1,
        time: 1,
        venue: 1,
        category: 1,
        capacity: 1,
        published: 1,
        completed: 1,
        coverImageUrl: 1,
        // Cards show two lines; no need to send up to 5,000 characters each.
        description: { $substrCP: ["$description", 0, 300] },
        counts: 1,
      },
    },
  ];
}

/** A list row as the dashboard shows it. The form questions are left out. */
export function toAdminEventListItem(row: EventListRow, now = new Date()): AdminEvent {
  return {
    id: row._id.toString(),
    title: row.title,
    date: dayParts(eventDay(row.date)),
    time: row.time ?? "",
    venue: row.venue ?? "",
    category: row.category ?? "",
    status: deriveStatus(row, now),
    capacity: row.capacity ?? 0,
    registeredCount: row.counts[0]?.registered ?? 0,
    attendedCount: row.counts[0]?.attended ?? 0,
    description: row.description,
    published: row.published !== false,
    coverImageUrl: row.coverImageUrl || undefined,
  };
}

/** Registered and attended counts per event (soft-deleted registrations excluded). */
export async function countsByEvent(ids: Types.ObjectId[]) {
  const map = new Map<string, EventCounts>();
  if (ids.length === 0) return map;
  const rows = await EventRegistration.aggregate<{
    _id: Types.ObjectId;
    registered: number;
    attended: number;
  }>([
    { $match: { eventId: { $in: ids }, deleted: { $ne: true } } },
    {
      $group: {
        _id: "$eventId",
        registered: { $sum: 1 },
        attended: { $sum: { $cond: ["$attended", 1, 0] } },
      },
    },
  ]);
  for (const row of rows) {
    map.set(row._id.toString(), { registered: row.registered, attended: row.attended });
  }
  return map;
}

export function isDuplicateKeyError(
  error: unknown
): error is { code: 11000; keyPattern?: Record<string, unknown> } {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === 11000
  );
}
