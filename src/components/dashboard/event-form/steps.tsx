"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { MAX_IMAGE_MB, uploadImage } from "@/lib/upload-client";
import FieldBuilder from "./FieldBuilder";
import {
  CheckRow,
  ChoiceCards,
  Field,
  FieldError,
  SectionHeader,
  describe,
  inputClass,
} from "./FormParts";
import {
  CATEGORIES,
  isDate,
  isLink,
  incompleteResources,
  type ErrorKey,
  type FormValues,
} from "./formModel";

export interface StepProps {
  v: FormValues;
  set: <K extends keyof FormValues>(key: K, value: FormValues[K]) => void;
  /** A field's error, once the person has left it or tried to continue. */
  err: (key: ErrorKey) => string | undefined;
  touch: (key: ErrorKey) => void;
}

// ------------------------------------------------------------- basics ----

export function StepBasics({ v, set, err, touch }: StepProps) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Basics"
        hint="Give the event a name and tell people what it's about. You can change all of this later."
      />

      <Field
        id="ev-title"
        label="Event title"
        required
        error={err("title")}
        hint="This is also used to build the event's web address."
      >
        <input
          {...describe("ev-title", { hint: true, error: err("title") })}
          type="text"
          value={v.title}
          maxLength={150}
          onChange={(e) => set("title", e.target.value)}
          onBlur={() => touch("title")}
          placeholder="e.g. PTSC HackFest '26"
          className={inputClass}
        />
      </Field>

      <Field
        id="ev-description"
        label="Description"
        required
        error={err("description")}
        aside={`${v.description.length} / 5000`}
        hint="What will people do or learn? This appears on the event page."
      >
        <textarea
          {...describe("ev-description", { hint: true, error: err("description") })}
          value={v.description}
          maxLength={5000}
          rows={6}
          onChange={(e) => set("description", e.target.value)}
          onBlur={() => touch("description")}
          placeholder="Describe the event, who it's for, and what to expect."
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field id="ev-category" label="Category" hint="Shown as a label on the event card.">
        <select
          id="ev-category"
          aria-describedby="ev-category-hint"
          value={v.category}
          onChange={(e) => set("category", e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          {/* Events imported from the old site have no category. */}
          {!CATEGORIES.includes(v.category) && (
            <option value={v.category}>{v.category || "Uncategorised"}</option>
          )}
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <CheckRow
        checked={v.published}
        onChange={(checked) => set("published", checked)}
        title="Publish on website"
        description="Untick to keep this event as a draft that only the team can see, and to close its public registration."
      />
    </div>
  );
}

// --------------------------------------------------------- date & venue ----

export function StepWhen({ v, set, err, touch }: StepProps) {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Date & venue"
        hint="When and where the event takes place, and how many people it can hold."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          id="ev-date"
          label="Date"
          required
          error={err("date")}
          hint={
            isDate(v.date)
              ? "Registration stays open through this day, then closes."
              : "The day the event takes place."
          }
        >
          <input
            {...describe("ev-date", { hint: true, error: err("date") })}
            type="date"
            value={v.date}
            onChange={(e) => set("date", e.target.value)}
            onBlur={() => touch("date")}
            className={`${inputClass} scheme-dark`}
          />
        </Field>

        <Field
          id="ev-time"
          label="Time"
          optional
          hint="Free text, so you can give a range."
        >
          <input
            id="ev-time"
            aria-describedby="ev-time-hint"
            type="text"
            value={v.time}
            maxLength={60}
            onChange={(e) => set("time", e.target.value)}
            placeholder="e.g. 10:00 AM – 4:00 PM"
            className={inputClass}
          />
        </Field>

        <Field
          id="ev-venue"
          label="Venue"
          optional
          hint="Shows as “Venue to be announced” until you add one."
        >
          <input
            id="ev-venue"
            aria-describedby="ev-venue-hint"
            type="text"
            value={v.venue}
            maxLength={150}
            onChange={(e) => set("venue", e.target.value)}
            placeholder="e.g. Seminar Hall, Block 4"
            className={inputClass}
          />
        </Field>

        <Field
          id="ev-capacity"
          label="Capacity"
          hint="The most registrations to accept. 0 means no limit."
        >
          <input
            id="ev-capacity"
            aria-describedby="ev-capacity-hint"
            type="number"
            min={0}
            inputMode="numeric"
            value={v.capacity}
            onChange={(e) => set("capacity", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
      </div>
    </div>
  );
}

// ---------------------------------------------------------- registration ----

export function StepRegistration({ v, set, err, touch }: StepProps) {
  const team = v.regType === "team";
  const googleOnly = !v.useCustomForm;
  const needsLink = googleOnly || v.forceGoogleForm;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Registration"
        hint="Choose who signs up and how their answers are collected."
      />

      <ChoiceCards
        name="regType"
        legend="Who registers?"
        value={v.regType}
        onChange={(value) => set("regType", value)}
        options={[
          {
            value: "individual",
            title: "Individuals",
            description: "Each person registers on their own.",
          },
          {
            value: "team",
            title: "Teams",
            description: "A team registers together and picks a leader.",
          },
        ]}
      />

      {team && (
        <div>
          <div className="grid grid-cols-2 gap-5 max-w-md">
            <Field id="ev-team" label="Smallest team" required>
              <input
                {...describe("ev-team", { error: err("team") })}
                type="number"
                min={1}
                inputMode="numeric"
                value={v.teamMinSize}
                onChange={(e) => set("teamMinSize", Number(e.target.value))}
                onBlur={() => touch("team")}
                className={inputClass}
              />
            </Field>
            <Field id="ev-team-max" label="Largest team" required>
              <input
                id="ev-team-max"
                aria-invalid={err("team") ? true : undefined}
                type="number"
                min={v.teamMinSize}
                inputMode="numeric"
                value={v.teamMaxSize}
                onChange={(e) => set("teamMaxSize", Number(e.target.value))}
                onBlur={() => touch("team")}
                className={inputClass}
              />
            </Field>
          </div>
          {err("team") && <FieldError message={err("team")!} />}
        </div>
      )}

      <ChoiceCards
        name="regMethod"
        legend="How do people register?"
        value={v.useCustomForm ? "builtin" : "google"}
        onChange={(value) => set("useCustomForm", value === "builtin")}
        options={[
          {
            value: "builtin",
            title: "Built-in form",
            description: "People register on this site. Answers appear under Registrations.",
          },
          {
            value: "google",
            title: "Google Form",
            description: "Send people to a form you already have.",
          },
        ]}
      />

      {v.useCustomForm && (
        <div id="ev-fields" tabIndex={-1} className="space-y-5 outline-none">
          <p className="text-xs text-neutral-500 leading-relaxed">
            {team
              ? "Name, gender, roll number, mobile number and email are always asked of every team member. Add any extra questions below."
              : "Name, gender, roll number, mobile number and email are always asked. Add any extra questions below."}
          </p>

          {err("fields") && <FieldError message={err("fields")!} />}

          <FieldBuilder
            hint={team ? "Team questions (asked once per team)" : "Extra questions (asked of each person)"}
            addLabel="Add question"
            itemLabel="Question"
            fields={v.fields}
            onChange={(fields) => set("fields", fields)}
          />

          {team && (
            <FieldBuilder
              hint="Member questions (asked of every team member)"
              addLabel="Add member question"
              itemLabel="Member question"
              fields={v.participantFields}
              onChange={(fields) => set("participantFields", fields)}
            />
          )}

          <CheckRow
            checked={v.forceGoogleForm}
            onChange={(checked) => set("forceGoogleForm", checked)}
            title="Use a Google Form instead"
            description="Send people to a Google Form rather than the built-in form, for example if the built-in form has a problem on the day."
          />
        </div>
      )}

      {needsLink && (
        <Field
          id="ev-googleFormLink"
          label="Google Form link"
          required
          error={err("googleFormLink")}
          hint="People are sent here to register."
        >
          <input
            {...describe("ev-googleFormLink", { hint: true, error: err("googleFormLink") })}
            type="url"
            value={v.googleFormLink}
            onChange={(e) => set("googleFormLink", e.target.value)}
            onBlur={() => touch("googleFormLink")}
            placeholder="https://forms.gle/…"
            className={inputClass}
          />
        </Field>
      )}
    </div>
  );
}

// --------------------------------------------------------- links & media ----

export function StepExtras({ v, set, err, touch }: StepProps) {
  // The cover URL that failed to load, so the preview can say so.
  const [badCover, setBadCover] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cover = v.coverImageUrl.trim();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      set("coverImageUrl", await uploadImage(file));
    } catch (error) {
      setUploadError(errorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const showPreview = cover !== "" && isLink(cover);
  const incomplete = incompleteResources(v);

  const updateResource = (index: number, patch: Partial<FormValues["resources"][number]>) =>
    set(
      "resources",
      v.resources.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Links & media"
        hint="Everything here is optional. Add what helps people prepare."
      />

      <div className="space-y-6">
        <Field
          id="ev-coverImageUrl"
          label="Cover image"
          optional
          error={err("coverImageUrl") ?? uploadError ?? undefined}
          hint={`Upload an image (JPG, PNG, WebP or GIF, up to ${MAX_IMAGE_MB} MB) or paste a link to one. Wide images look best. Without one, a default image is used.`}
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              {...describe("ev-coverImageUrl", {
                hint: true,
                error: err("coverImageUrl") ?? uploadError ?? undefined,
              })}
              type="url"
              value={v.coverImageUrl}
              onChange={(e) => set("coverImageUrl", e.target.value)}
              onBlur={() => touch("coverImageUrl")}
              placeholder="https://… image link"
              className={`${inputClass} sm:flex-1`}
            />
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFile}
              className="sr-only"
              tabIndex={-1}
              aria-label="Choose a cover image to upload"
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{uploading ? "Uploading…" : "Upload image"}</span>
            </button>
          </div>
        </Field>

        {showPreview &&
          (badCover === cover ? (
            <p className="text-xs text-amber-400">
              This link didn&apos;t load as an image. Check it opens in a browser, or leave it
              empty to use the default image.
            </p>
          ) : (
            <div className="relative h-32 w-full sm:w-64 overflow-hidden rounded-xl border border-white/10 bg-[#18181b]">
              <Image
                src={cover}
                alt="Cover preview"
                fill
                unoptimized
                onError={() => setBadCover(cover)}
                className="object-cover"
              />
            </div>
          ))}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            id="ev-ruleBookUrl"
            label="Rulebook link"
            optional
            error={err("ruleBookUrl")}
            hint="Adds a Rulebook button on the event page."
          >
            <input
              {...describe("ev-ruleBookUrl", { hint: true, error: err("ruleBookUrl") })}
              type="url"
              value={v.ruleBookUrl}
              onChange={(e) => set("ruleBookUrl", e.target.value)}
              onBlur={() => touch("ruleBookUrl")}
              placeholder="https://… rules or guidelines"
              className={inputClass}
            />
          </Field>

          <Field
            id="ev-whatsappGroupLink"
            label="WhatsApp group link"
            optional
            error={err("whatsappGroupLink")}
            hint="Shown on the event page and after registering."
          >
            <input
              {...describe("ev-whatsappGroupLink", {
                hint: true,
                error: err("whatsappGroupLink"),
              })}
              type="url"
              value={v.whatsappGroupLink}
              onChange={(e) => set("whatsappGroupLink", e.target.value)}
              onBlur={() => touch("whatsappGroupLink")}
              placeholder="https://chat.whatsapp.com/…"
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <section aria-labelledby="ev-resources-title" className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 id="ev-resources-title" className="text-sm font-semibold text-white">
              Resources
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              Links shown under the event description, such as a problem set or slides.
            </p>
          </div>
          <button
            type="button"
            onClick={() => set("resources", [...v.resources, { label: "", url: "" }])}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add resource</span>
          </button>
        </div>

        {err("resources") && <FieldError message={err("resources")!} />}

        {v.resources.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 px-4 py-5 text-center text-sm text-neutral-500">
            No resources yet.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {v.resources.map((res, index) => (
              <li
                key={index}
                className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_auto] gap-2 items-end rounded-xl border border-white/10 p-3"
              >
                <div>
                  <label
                    htmlFor={`ev-res-label-${index}`}
                    className="mb-1 block text-[11px] text-neutral-400"
                  >
                    Label
                  </label>
                  <input
                    id={`ev-res-label-${index}`}
                    type="text"
                    value={res.label}
                    maxLength={100}
                    onChange={(e) => updateResource(index, { label: e.target.value })}
                    placeholder="e.g. Problem set"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`ev-res-url-${index}`}
                    className="mb-1 block text-[11px] text-neutral-400"
                  >
                    Link
                  </label>
                  <input
                    id={`ev-res-url-${index}`}
                    type="url"
                    value={res.url}
                    onChange={(e) => updateResource(index, { url: e.target.value })}
                    onBlur={() => touch("resources")}
                    placeholder="https://…"
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "resources",
                      v.resources.filter((_, i) => i !== index)
                    )
                  }
                  aria-label={`Remove resource ${index + 1}`}
                  className="justify-self-end rounded-lg p-2.5 text-red-400 transition-colors hover:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {incomplete.includes(index) && (
                  <p className="text-xs text-amber-400 sm:col-span-3">
                    Add both a label and a link, or this row is left out when you save.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- review ----

function Row({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="w-32 shrink-0 text-xs text-neutral-500 sm:w-40">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm text-white break-words">
        {value || <span className="text-neutral-500">Not set</span>}
      </dd>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-xs text-neutral-400 underline-offset-4 hover:text-white hover:underline cursor-pointer"
      >
        Edit
      </button>
    </div>
  );
}

export function StepReview({
  v,
  onEdit,
  editing,
}: {
  v: FormValues;
  /** Jumps to the step where a value is edited. */
  onEdit: (step: number) => void;
  editing: boolean;
}) {
  const team = v.regType === "team";
  const questions = (team ? v.fields.length + v.participantFields.length : v.fields.length);
  const googleOnly = !v.useCustomForm || v.forceGoogleForm;
  const resources = v.resources.filter((r) => r.label.trim() && r.url.trim()).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Review"
        hint={
          editing
            ? "Check the details, then save your changes."
            : "Check the details, then create the event. You can edit anything afterwards."
        }
      />

      <dl className="divide-y divide-white/8 rounded-xl border border-white/10 px-4">
        <Row label="Title" value={v.title.trim()} onEdit={() => onEdit(0)} />
        <Row
          label="Description"
          value={v.description.trim() && <span className="line-clamp-3">{v.description.trim()}</span>}
          onEdit={() => onEdit(0)}
        />
        <Row label="Category" value={v.category} onEdit={() => onEdit(0)} />
        <Row
          label="Visibility"
          value={v.published ? "Published on the website" : "Draft, hidden from the website"}
          onEdit={() => onEdit(0)}
        />
        <Row label="Date" value={v.date} onEdit={() => onEdit(1)} />
        <Row label="Time" value={v.time.trim()} onEdit={() => onEdit(1)} />
        <Row label="Venue" value={v.venue.trim()} onEdit={() => onEdit(1)} />
        <Row
          label="Capacity"
          value={v.capacity > 0 ? `${v.capacity} registrations` : "No limit"}
          onEdit={() => onEdit(1)}
        />
        <Row
          label="Registration"
          value={
            team
              ? `Teams of ${v.teamMinSize}${v.teamMaxSize !== v.teamMinSize ? `–${v.teamMaxSize}` : ""}`
              : "Individuals"
          }
          onEdit={() => onEdit(2)}
        />
        <Row
          label="Form"
          value={
            googleOnly
              ? "Google Form"
              : `Built-in form, ${questions} extra ${questions === 1 ? "question" : "questions"}`
          }
          onEdit={() => onEdit(2)}
        />
        <Row label="Cover image" value={v.coverImageUrl.trim()} onEdit={() => onEdit(3)} />
        <Row label="Rulebook" value={v.ruleBookUrl.trim()} onEdit={() => onEdit(3)} />
        <Row label="WhatsApp group" value={v.whatsappGroupLink.trim()} onEdit={() => onEdit(3)} />
        <Row
          label="Resources"
          value={resources > 0 ? `${resources} ${resources === 1 ? "link" : "links"}` : ""}
          onEdit={() => onEdit(3)}
        />
      </dl>

      {!v.published && (
        <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs text-amber-300 leading-relaxed">
          This event will be saved as a draft. It won&apos;t appear on the website and
          registration stays closed until you publish it.
        </p>
      )}
    </div>
  );
}
