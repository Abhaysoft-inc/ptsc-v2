import "server-only";
import { z } from "zod";
import type { EventDoc } from "@/models/Event";

type StoredField = NonNullable<EventDoc["registrationFields"]>[number];
export type Answers = Record<string, string | string[]>;

const text = (max: number) => z.string().trim().max(max);

/** A 10-digit Indian mobile number; a +91 or leading 0 is dropped. */
const phone = z
  .string()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+?91|0)(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number."));

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address.").max(200));

/** The built-in questions every registrant (or team member) answers. */
export const personSchema = z.object({
  name: text(100).min(1, "Name is required."),
  gender: z.enum(["Male", "Female", "Other"], "Select a gender."),
  rollNo: z
    .string()
    .trim()
    .regex(/^\d{5,6}$/, "Roll number must be 5 or 6 digits."),
  contactNo: phone,
  email,
  dynamic: z.record(z.string(), z.unknown()).default({}),
});
export type Person = z.output<typeof personSchema>;

export const individualSchema = personSchema;

export const teamSchema = z.object({
  team: z.object({
    teamName: text(100).min(1, "Team name is required."),
    dynamic: z.record(z.string(), z.unknown()).default({}),
  }),
  participants: z.array(personSchema).min(1, "Add at least one team member.").max(50),
  leaderIndex: z.number().int().min(0).default(0),
});

const URL_RX = /^https?:\/\/\S+$/i;

/**
 * Checks the answers to an event's custom questions and returns them cleaned:
 * only the declared fields are kept, values are trimmed, and each value must
 * suit its field type. File fields are skipped, since uploads aren't supported
 * yet.
 */
export function cleanAnswers(
  fields: StoredField[],
  raw: Record<string, unknown>,
  prefix = ""
): { data: Answers } | { error: string } {
  const data: Answers = {};

  for (const f of fields) {
    if (f.type === "file") continue;
    const label = f.label || f.name;

    let value: unknown = raw[f.name];
    if (Array.isArray(value)) {
      value = value
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim().slice(0, 200))
        .filter(Boolean)
        .slice(0, 50);
    } else if (typeof value === "number" || typeof value === "boolean") {
      value = String(value);
    } else if (typeof value === "string") {
      value = value.trim();
    } else {
      value = undefined;
    }

    const empty =
      value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
    if (empty) {
      if (f.required) return { error: `${prefix}${label} is required.` };
      continue;
    }

    const options = f.options ?? [];
    if (f.type === "checkbox") {
      const picked = Array.isArray(value) ? value : [value as string];
      if (options.length && picked.some((p) => !options.includes(p))) {
        return { error: `${prefix}Choose valid options for ${label}.` };
      }
      data[f.name] = picked;
      continue;
    }

    if (Array.isArray(value)) return { error: `${prefix}Invalid ${label}.` };
    const str = value as string;
    if (str.length > 2000) return { error: `${prefix}${label} is too long.` };

    if (f.type === "select" && options.length && !options.includes(str)) {
      return { error: `${prefix}Choose a valid option for ${label}.` };
    }
    if (f.type === "email" && !z.email().safeParse(str).success) {
      return { error: `${prefix}Enter a valid email for ${label}.` };
    }
    if (f.type === "number" && !Number.isFinite(Number(str))) {
      return { error: `${prefix}${label} must be a number.` };
    }
    if (f.type === "url" && !URL_RX.test(str)) {
      return { error: `${prefix}${label} must be a full http(s) link.` };
    }
    if (f.type === "tel" && !/^[0-9+\-\s()]{7,20}$/.test(str)) {
      return { error: `${prefix}Enter a valid phone number for ${label}.` };
    }
    if (f.validation) {
      try {
        if (!new RegExp(f.validation).test(str)) {
          return { error: `${prefix}Invalid ${label}.` };
        }
      } catch {
        // An admin's broken pattern shouldn't stop people registering.
      }
    }
    data[f.name] = str;
  }

  return { data };
}

/** PTSC<yy><first letter of the event><4 digits>, e.g. PTSC26H4821. */
export function makeRegistrationId(title: string, now = new Date()) {
  const year = String(now.getFullYear()).slice(-2);
  const initial = /[A-Z0-9]/i.test(title.trim().charAt(0))
    ? title.trim().charAt(0).toUpperCase()
    : "X";
  const digits = String(Math.floor(Math.random() * 10_000)).padStart(4, "0");
  return `PTSC${year}${initial}${digits}`;
}
