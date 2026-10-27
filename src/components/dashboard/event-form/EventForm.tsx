"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  ImageIcon,
  Link as LinkIcon,
  MapPin,
  MessageSquare,
  Plus,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import {
  AdminEvent,
  EventResource,
  RegistrationField,
} from "@/lib/dashboard";
import FieldBuilder from "./FieldBuilder";
import { isOptionType } from "./fields";

interface EventFormProps {
  onSubmit: (
    eventData: Omit<AdminEvent, "id" | "registeredCount" | "attendedCount">
  ) => void;
  /** Where the Cancel link goes. */
  cancelHref: string;
}

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

const input =
  "w-full px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors";
const labelClass =
  "flex items-center gap-2 text-xs font-medium text-neutral-300 mb-1.5";

// "2026-01-25" -> { month: "JAN", day: "25", year: "2026" }
function toEventDate(value: string): AdminEvent["date"] | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  return { month: MONTHS[Number(month) - 1], day, year };
}

export default function EventForm({ onSubmit, cancelHref }: EventFormProps) {
  // Basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [category, setCategory] = useState("Hackathon");
  const [capacity, setCapacity] = useState(100);
  const [ruleBookUrl, setRuleBookUrl] = useState("");

  // Registration settings
  const [regType, setRegType] = useState<"individual" | "team">("individual");
  const [teamMinSize, setTeamMinSize] = useState(2);
  const [teamMaxSize, setTeamMaxSize] = useState(4);
  const [whatsappGroupLink, setWhatsappGroupLink] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [useCustomForm, setUseCustomForm] = useState(false);
  const [googleFormLink, setGoogleFormLink] = useState("");
  const [forceGoogleForm, setForceGoogleForm] = useState(false);
  const [fields, setFields] = useState<RegistrationField[]>([]);
  const [participantFields, setParticipantFields] = useState<RegistrationField[]>([]);

  // Resources
  const [resources, setResources] = useState<EventResource[]>([
    { label: "", url: "" },
  ]);

  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!title.trim()) return "Event title is required.";
    if (!description.trim()) return "Event description is required.";
    if (!toEventDate(date)) return "A valid event date is required.";

    if (useCustomForm) {
      const allFields =
        regType === "team" ? [...fields, ...participantFields] : fields;
      for (const f of allFields) {
        if (!f.name.trim() || !f.label.trim())
          return "Every custom field needs a name and a label.";
        if (isOptionType(f.type) && f.options.filter((o) => o.trim()).length === 0)
          return `Field "${f.label || f.name}" needs at least one option.`;
      }
    } else if (!googleFormLink.trim()) {
      return "Enable the custom form or provide a Google Form link.";
    }

    if (regType === "team" && (teamMinSize < 1 || teamMaxSize < teamMinSize)) {
      return "Team size must have min ≥ 1 and max ≥ min.";
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    const eventDate = toEventDate(date)!;
    const cleanFields = (list: RegistrationField[]) =>
      list.map((f) =>
        isOptionType(f.type)
          ? { ...f, options: f.options.filter((o) => o.trim()) }
          : f
      );

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      date: eventDate,
      time: time.trim() || "Time to be announced",
      venue: venue.trim() || "Venue to be announced",
      category,
      capacity: Number(capacity) || 100,
      status: "Upcoming",
      coverImageUrl: coverImageUrl.trim() || undefined,
      ruleBookUrl: ruleBookUrl.trim() || undefined,
      whatsappGroupLink: whatsappGroupLink.trim() || undefined,
      resources: resources.filter((r) => r.label.trim() && r.url.trim()),
      registration: {
        type: regType,
        teamMinSize,
        teamMaxSize,
        useCustomForm,
        googleFormLink: googleFormLink.trim(),
        forceGoogleForm,
        fields: useCustomForm ? cleanFields(fields) : [],
        participantFields:
          useCustomForm && regType === "team"
            ? cleanFields(participantFields)
            : [],
      },
    });
  };

  const updateResource = (index: number, patch: Partial<EventResource>) =>
    setResources((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <section className="space-y-4 rounded-2xl bg-[#111113] border border-white/10 p-6">
        <h3 className="text-sm font-bold text-white">Basic Information</h3>

        <div>
          <label className={labelClass}>Event Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. PTSC HackFest '26"
            className={input}
          />
        </div>

        <div>
          <label className={labelClass}>Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this event about?"
            rows={4}
            className={`${input} resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <CalendarDays className="w-4 h-4" /> Event Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${input} [color-scheme:dark]`}
            />
          </div>
          <div>
            <label className={labelClass}>
              <Clock className="w-4 h-4" /> Event Time
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 10:00 AM – 4:00 PM"
              className={input}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <MapPin className="w-4 h-4" /> Venue
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Campus Auditorium Hall A"
              className={input}
            />
          </div>
          <div>
            <label className={labelClass}>
              <Tag className="w-4 h-4" /> Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${input} cursor-pointer`}
            >
              {["Hackathon", "Workshop", "Demo Day", "Sprint", "Talk", "Meetup"].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <Users className="w-4 h-4" /> Capacity
            </label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className={input}
            />
          </div>
          <div>
            <label className={labelClass}>
              <LinkIcon className="w-4 h-4" /> Rule Book URL
            </label>
            <input
              type="url"
              value={ruleBookUrl}
              onChange={(e) => setRuleBookUrl(e.target.value)}
              placeholder="https://… (rules or guidelines)"
              className={input}
            />
          </div>
        </div>
      </section>

      {/* Registration settings */}
      <section className="space-y-4 rounded-2xl bg-[#111113] border border-white/10 p-6">
        <h3 className="text-sm font-bold text-white">Registration Settings</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Registration Type</label>
            <select
              value={regType}
              onChange={(e) =>
                setRegType(e.target.value as "individual" | "team")
              }
              className={`${input} cursor-pointer`}
            >
              <option value="individual">Individual</option>
              <option value="team">Team</option>
            </select>
          </div>
          {regType === "team" && (
            <>
              <div>
                <label className={labelClass}>Min Team Size</label>
                <input
                  type="number"
                  min={1}
                  value={teamMinSize}
                  onChange={(e) => setTeamMinSize(Number(e.target.value))}
                  className={input}
                />
              </div>
              <div>
                <label className={labelClass}>Max Team Size</label>
                <input
                  type="number"
                  min={teamMinSize}
                  value={teamMaxSize}
                  onChange={(e) => setTeamMaxSize(Number(e.target.value))}
                  className={input}
                />
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              <MessageSquare className="w-4 h-4" /> WhatsApp Group Link
            </label>
            <input
              type="url"
              value={whatsappGroupLink}
              onChange={(e) => setWhatsappGroupLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/…"
              className={input}
            />
          </div>
          <div>
            <label className={labelClass}>
              <ImageIcon className="w-4 h-4" /> Cover Image URL
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://… image URL"
              className={input}
            />
          </div>
        </div>

        {coverImageUrl.trim() && (
          <div className="relative h-28 w-full sm:w-64 rounded-xl overflow-hidden border border-white/10 bg-[#18181b]">
            <Image
              src={coverImageUrl}
              alt="Cover preview"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useCustomForm}
            onChange={(e) => setUseCustomForm(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded accent-white"
          />
          <span>
            <span className="text-sm text-white">
              Use custom registration form
            </span>
            <span className="block text-xs text-neutral-400">
              Build an in-app form with your own fields instead of a Google
              Form.
            </span>
          </span>
        </label>

        {!useCustomForm && (
          <div>
            <label className={labelClass}>
              <LinkIcon className="w-4 h-4" /> Google Form Link *
            </label>
            <input
              type="url"
              value={googleFormLink}
              onChange={(e) => setGoogleFormLink(e.target.value)}
              placeholder="https://forms.google.com/…"
              className={input}
            />
          </div>
        )}

        {useCustomForm && (
          <div className="space-y-5">
            <FieldBuilder
              hint={
                regType === "team"
                  ? "Team details (asked once per team)"
                  : "Additional fields (asked per registrant)"
              }
              addLabel="Add Field"
              itemLabel="Field"
              fields={fields}
              onChange={setFields}
            />

            {regType === "team" && (
              <FieldBuilder
                hint="Participant details (asked of the leader and every member)"
                addLabel="Add Participant Field"
                itemLabel="Participant Field"
                fields={participantFields}
                onChange={setParticipantFields}
              />
            )}
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={forceGoogleForm}
            onChange={(e) => setForceGoogleForm(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded accent-white"
          />
          <span>
            <span className="text-sm text-white">
              Force Google Form (fallback)
            </span>
            <span className="block text-xs text-neutral-400">
              Send users to the Google Form instead of the in-app form.
            </span>
          </span>
        </label>

        {forceGoogleForm && (
          <div>
            <label className={labelClass}>
              <LinkIcon className="w-4 h-4" /> Google Form Link
              {useCustomForm ? "" : " *"}
            </label>
            <input
              type="url"
              value={googleFormLink}
              onChange={(e) => setGoogleFormLink(e.target.value)}
              placeholder="https://forms.google.com/…"
              className={input}
            />
          </div>
        )}
      </section>

      {/* Resources */}
      <section className="space-y-3 rounded-2xl bg-[#111113] border border-white/10 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Resources</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Links shown under the event description.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setResources((prev) => [...prev, { label: "", url: "" }])
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Resource</span>
          </button>
        </div>

        {resources.map((res, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_auto] gap-2 items-end rounded-xl bg-[#0d0d10] border border-white/10 p-3"
          >
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                Label
              </label>
              <input
                type="text"
                value={res.label}
                onChange={(e) => updateResource(index, { label: e.target.value })}
                placeholder="e.g. Problem Set"
                className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                URL
              </label>
              <input
                type="url"
                value={res.url}
                onChange={(e) => updateResource(index, { url: e.target.value })}
                placeholder="https://…"
                className="w-full px-3 py-2 bg-[#18181b] border border-white/10 rounded-lg text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-white/30"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setResources((prev) => prev.filter((_, i) => i !== index))
              }
              disabled={resources.length === 1}
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Remove resource"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </section>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href={cancelHref}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-sm font-semibold shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Event</span>
        </button>
      </div>
    </form>
  );
}
