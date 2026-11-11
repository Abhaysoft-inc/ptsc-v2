import type {
  AdminEvent,
  EventInput,
  EventResource,
  RegistrationField,
} from "@/lib/types/admin";
import { isOptionType } from "./fields";

export const CATEGORIES = [
  "Hackathon",
  "Workshop",
  "Demo Day",
  "Sprint",
  "Talk",
  "Meetup",
  "Other",
];

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/** Everything the form edits, in one object so it can be saved and restored whole. */
export interface FormValues {
  // Basics
  title: string;
  description: string;
  category: string;
  published: boolean;
  // Date & venue
  date: string; // "YYYY-MM-DD"
  time: string;
  venue: string;
  capacity: number;
  // Registration
  regType: "individual" | "team";
  teamMinSize: number;
  teamMaxSize: number;
  useCustomForm: boolean;
  googleFormLink: string;
  forceGoogleForm: boolean;
  fields: RegistrationField[];
  participantFields: RegistrationField[];
  // Links & media
  ruleBookUrl: string;
  whatsappGroupLink: string;
  coverImageUrl: string;
  resources: EventResource[];
}

// { month: "JAN", day: "25", year: "2026" } -> "2026-01-25" (for <input type="date">)
function toDateInput(date: AdminEvent["date"] | undefined) {
  if (!date) return "";
  const month = MONTHS.indexOf(date.month) + 1;
  return month > 0 ? `${date.year}-${String(month).padStart(2, "0")}-${date.day}` : "";
}

/** Starting values: an existing event's, or the defaults for a new one. */
export function valuesFromEvent(initial?: AdminEvent): FormValues {
  const reg = initial?.registration;
  return {
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category: initial ? initial.category : "Hackathon",
    published: initial?.published ?? true,
    date: toDateInput(initial?.date),
    time: initial?.time ?? "",
    venue: initial?.venue ?? "",
    capacity: initial?.capacity ?? 100,
    regType: reg?.type ?? "individual",
    teamMinSize: reg && reg.type === "team" ? reg.teamMinSize : 2,
    teamMaxSize: reg && reg.type === "team" ? reg.teamMaxSize : 4,
    useCustomForm: reg?.useCustomForm ?? false,
    googleFormLink: reg?.googleFormLink ?? "",
    forceGoogleForm: reg?.forceGoogleForm ?? false,
    fields: reg?.fields ?? [],
    participantFields: reg?.participantFields ?? [],
    ruleBookUrl: initial?.ruleBookUrl ?? "",
    whatsappGroupLink: initial?.whatsappGroupLink ?? "",
    coverImageUrl: initial?.coverImageUrl ?? "",
    resources: initial?.resources ?? [],
  };
}

// ---------------------------------------------------------------- steps ----

export const STEPS = [
  { id: "basics", title: "Basics", hint: "Name and describe the event" },
  { id: "when", title: "Date & venue", hint: "When and where it happens" },
  { id: "registration", title: "Registration", hint: "Who signs up, and how" },
  { id: "extras", title: "Links & media", hint: "Cover image, rulebook, resources" },
  { id: "review", title: "Review", hint: "Check everything, then save" },
] as const;

export const LAST_STEP = STEPS.length - 1;

// ----------------------------------------------------------- validation ----

export type ErrorKey =
  | "title"
  | "description"
  | "date"
  | "team"
  | "fields"
  | "googleFormLink"
  | "ruleBookUrl"
  | "whatsappGroupLink"
  | "coverImageUrl"
  | "resources";
export type Errors = Partial<Record<ErrorKey, string>>;

/** Which step each problem is fixed on. */
export const STEP_OF: Record<ErrorKey, number> = {
  title: 0,
  description: 0,
  date: 1,
  team: 2,
  fields: 2,
  googleFormLink: 2,
  ruleBookUrl: 3,
  whatsappGroupLink: 3,
  coverImageUrl: 3,
  resources: 3,
};

const HTTP_LINK = /^https?:\/\/\S+$/i;
export const LINK_ERROR = "Enter a full link starting with http:// or https://";
export const isLink = (value: string) => HTTP_LINK.test(value.trim());

export const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Every problem with the current values, keyed by field. Empty when ready to save. */
export function validate(v: FormValues): Errors {
  const errors: Errors = {};

  if (!v.title.trim()) errors.title = "Event title is required.";
  if (!v.description.trim()) errors.description = "Event description is required.";
  if (!isDate(v.date)) errors.date = "A valid event date is required.";

  if (v.useCustomForm) {
    const all = v.regType === "team" ? [...v.fields, ...v.participantFields] : v.fields;
    for (const f of all) {
      if (!f.name.trim() || !f.label.trim()) {
        errors.fields = "Every custom field needs a name and a label.";
        break;
      }
      if (isOptionType(f.type) && f.options.filter((o) => o.trim()).length === 0) {
        errors.fields = `Field "${f.label || f.name}" needs at least one option.`;
        break;
      }
    }
    if (v.forceGoogleForm && !v.googleFormLink.trim()) {
      errors.googleFormLink = "Add the Google Form link people should be sent to.";
    }
  } else if (!v.googleFormLink.trim()) {
    errors.googleFormLink = "Enable the custom form or provide a Google Form link.";
  }

  if (v.googleFormLink.trim() && !isLink(v.googleFormLink)) {
    errors.googleFormLink = LINK_ERROR;
  }

  if (v.regType === "team" && (v.teamMinSize < 1 || v.teamMaxSize < v.teamMinSize)) {
    errors.team = "Team size must have min ≥ 1 and max ≥ min.";
  }

  if (v.ruleBookUrl.trim() && !isLink(v.ruleBookUrl)) errors.ruleBookUrl = LINK_ERROR;
  if (v.whatsappGroupLink.trim() && !isLink(v.whatsappGroupLink)) {
    errors.whatsappGroupLink = LINK_ERROR;
  }
  if (v.coverImageUrl.trim() && !isLink(v.coverImageUrl)) errors.coverImageUrl = LINK_ERROR;

  if (v.resources.some((r) => r.label.trim() && r.url.trim() && !isLink(r.url))) {
    errors.resources = "A resource link must start with http:// or https://";
  }

  return errors;
}

/** Resource rows with only one of label / link filled in. They're skipped when saving. */
export function incompleteResources(v: FormValues) {
  return v.resources.flatMap((r, i) =>
    Boolean(r.label.trim()) !== Boolean(r.url.trim()) ? [i] : []
  );
}

// -------------------------------------------------------------- payload ----

const cleanFields = (list: RegistrationField[]) =>
  list.map((f) =>
    isOptionType(f.type) ? { ...f, options: f.options.filter((o) => o.trim()) } : f
  );

/** The body sent to the API. */
export function toInput(v: FormValues): EventInput {
  return {
    title: v.title.trim(),
    description: v.description.trim(),
    date: v.date,
    time: v.time.trim(),
    venue: v.venue.trim(),
    category: v.category,
    capacity: Math.max(0, Math.floor(Number(v.capacity) || 0)),
    published: v.published,
    coverImageUrl: v.coverImageUrl.trim() || undefined,
    ruleBookUrl: v.ruleBookUrl.trim() || undefined,
    whatsappGroupLink: v.whatsappGroupLink.trim() || undefined,
    resources: v.resources.filter((r) => r.label.trim() && r.url.trim()),
    registration: {
      type: v.regType,
      teamMinSize: v.teamMinSize,
      teamMaxSize: v.teamMaxSize,
      useCustomForm: v.useCustomForm,
      googleFormLink: v.googleFormLink.trim(),
      forceGoogleForm: v.forceGoogleForm,
      fields: v.useCustomForm ? cleanFields(v.fields) : [],
      participantFields:
        v.useCustomForm && v.regType === "team" ? cleanFields(v.participantFields) : [],
    },
  };
}

// ---------------------------------------------------------------- draft ----
// A half-filled create form is kept in this browser (localStorage) so a refresh,
// a closed tab or a slip of the mouse doesn't lose it. It's never sent anywhere
// until the event is actually created.

const DRAFT_KEY = "ptsc.create-event-draft.v1";

export interface Draft {
  values: FormValues;
  step: number;
  savedAt: number;
}

export function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.values !== "object" || parsed.values === null) return null;
    return {
      // Merged over the defaults so a draft saved by an older version still loads.
      values: { ...valuesFromEvent(), ...parsed.values },
      step: Number.isInteger(parsed.step) ? Math.min(Math.max(parsed.step, 0), LAST_STEP) : 0,
      savedAt: Number(parsed.savedAt) || Date.now(),
    };
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage can be blocked (private windows); the form still works without it.
  }
}

/**
 * Saves the draft and returns when, or null if there was nothing worth saving
 * (an untouched form) or storage isn't available.
 */
export function saveDraft(values: FormValues, step: number): number | null {
  if (JSON.stringify(values) === JSON.stringify(valuesFromEvent())) {
    clearDraft();
    return null;
  }
  try {
    const savedAt = Date.now();
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, step, savedAt }));
    return savedAt;
  } catch {
    return null;
  }
}
