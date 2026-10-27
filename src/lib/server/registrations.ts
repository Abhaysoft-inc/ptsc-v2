import "server-only";
import type { QueryFilter } from "mongoose";
import type { EventRegistrationDoc } from "@/models/EventRegistration";
import type { RegistrationPerson, RegistrationRow } from "@/lib/types/admin";
import { escapeRegex } from "./query";

type PersonLike = {
  dynamic?: unknown;
  name?: string | null;
  rollNo?: string | null;
  email?: string | null;
  contactNo?: string | null;
  gender?: string | null;
  branch?: string | null;
  year?: number | null;
};

type RegistrationRecord = EventRegistrationDoc & {
  _id: { toString(): string };
};

function person(p: PersonLike | undefined | null): RegistrationPerson {
  return {
    name: p?.name ?? "",
    rollNo: p?.rollNo ?? "",
    email: p?.email ?? "",
    contactNo: p?.contactNo ?? "",
    gender: p?.gender ?? "",
    branch: p?.branch ?? "",
    year: p?.year ?? null,
    details: flattenDetails(p?.dynamic),
  };
}

// The old site also copied these into the custom-answer blob; they duplicate
// real fields, so they're left out of the answers.
const DUPLICATE_KEYS = new Set(["eventId", "year", "branch"]);

/** Custom form answers as plain text (arrays joined, nested values stringified). */
export function flattenDetails(...sources: unknown[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    for (const [rawKey, value] of Object.entries(source as Record<string, unknown>)) {
      const key = rawKey.trim();
      if (DUPLICATE_KEYS.has(key)) continue;
      if (value === null || value === undefined || value === "") continue;
      out[key] = Array.isArray(value)
        ? value.join(", ")
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value);
    }
  }
  return out;
}

export function toRegistrationRow(r: RegistrationRecord): RegistrationRow {
  const participants = (r.participants ?? []).map(person);
  const isTeam = r.type === "team";
  const leaderIndex =
    isTeam && r.leaderIndex >= 0 && r.leaderIndex < participants.length
      ? r.leaderIndex
      : 0;

  return {
    id: r._id.toString(),
    registrationId: r.registrationId ?? "",
    type: isTeam ? "team" : "individual",
    teamName: isTeam ? r.team?.teamName || r.name || null : null,
    // An individual's answers live on the registration, so they're the
    // registration's details rather than the lead's.
    lead: isTeam && participants.length
      ? participants[leaderIndex]
      : { ...person(r), details: {} },
    participants: isTeam ? participants : [],
    leaderIndex,
    attended: Boolean(r.attended),
    attendedAt: r.attendedAt ? new Date(r.attendedAt).toISOString() : null,
    deleted: Boolean(r.deleted),
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
    details: flattenDetails(r.team?.dynamic, r.dynamic),
  };
}

/**
 * Filter for one event's registrations. `q` matches the registration ID, team
 * name, and the name, roll number, email or phone of the registrant or any
 * team member.
 */
export function registrationFilter(
  eventId: string,
  opts: { q?: string; deleted?: boolean; attended?: boolean }
): QueryFilter<EventRegistrationDoc> {
  const filter: QueryFilter<EventRegistrationDoc> = {
    eventId,
    // Old documents may lack the field entirely, which counts as not deleted.
    deleted: opts.deleted ? true : { $ne: true },
  };
  if (opts.attended !== undefined) filter.attended = opts.attended;

  if (opts.q) {
    const rx = { $regex: escapeRegex(opts.q), $options: "i" };
    filter.$or = [
      { registrationId: rx },
      { "team.teamName": rx },
      { name: rx },
      { rollNo: rx },
      { email: rx },
      { contactNo: rx },
      { "participants.name": rx },
      { "participants.rollNo": rx },
      { "participants.email": rx },
      { "participants.contactNo": rx },
    ];
  }
  return filter;
}
