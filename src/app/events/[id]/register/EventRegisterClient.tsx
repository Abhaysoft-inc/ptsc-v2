"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Check,
  Ticket,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Trash2,
  Users,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { PublicEvent } from "@/lib/events";
import type { RegistrationField } from "@/lib/types/admin";
import { api, detailedErrorMessage } from "@/lib/api-client";

type Answers = Record<string, string | string[]>;

interface PersonState {
  name: string;
  gender: string;
  rollNo: string;
  contactNo: string;
  email: string;
  dynamic: Answers;
}

const emptyPerson = (): PersonState => ({
  name: "",
  gender: "",
  rollNo: "",
  contactNo: "",
  email: "",
  dynamic: {},
});

interface Registered {
  registrationId: string;
  name: string;
  whatsappGroupLink: string | null;
}

const input =
  "w-full px-4 py-3 rounded-xl bg-neutral-900/90 border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:border-white/30 focus:outline-none transition-all";
const label = "text-xs font-semibold text-neutral-300";

function Required() {
  return <span className="text-red-400"> *</span>;
}

/** One of the event's own custom questions. */
function AnswerField({
  field,
  value,
  onChange,
  id,
}: {
  field: RegistrationField;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  id: string;
}) {
  const text = typeof value === "string" ? value : "";

  let control: React.ReactNode;
  if (field.type === "file") {
    control = (
      <p className="text-xs text-neutral-500">
        File uploads aren&apos;t available yet. Share a link in another field, or send the
        file to the organisers.
      </p>
    );
  } else if (field.type === "textarea") {
    control = (
      <textarea
        id={id}
        rows={3}
        value={text}
        required={field.required}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${input} resize-none`}
      />
    );
  } else if (field.type === "select") {
    control = (
      <select
        id={id}
        value={text}
        required={field.required}
        onChange={(e) => onChange(e.target.value)}
        className={`${input} cursor-pointer`}
      >
        <option value="">Select…</option>
        {field.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  } else if (field.type === "checkbox") {
    const picked = Array.isArray(value) ? value : [];
    control = (
      <div className="flex flex-col gap-2">
        {field.options.map((o) => (
          <label key={o} className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={picked.includes(o)}
              onChange={(e) =>
                onChange(e.target.checked ? [...picked, o] : picked.filter((p) => p !== o))
              }
              className="w-4 h-4 rounded border-white/20 bg-neutral-900 accent-white cursor-pointer"
            />
            <span>{o}</span>
          </label>
        ))}
      </div>
    );
  } else {
    control = (
      <input
        id={id}
        type={field.type}
        value={text}
        required={field.required}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={input}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={label}>
        {field.label}
        {field.required && field.type !== "file" && <Required />}
      </label>
      {control}
      {field.description && <p className="text-[11px] text-neutral-500">{field.description}</p>}
    </div>
  );
}

/** Name, gender, roll number, phone and email, plus the event's per-person questions. */
function PersonFields({
  person,
  onChange,
  fields,
  idPrefix,
}: {
  person: PersonState;
  onChange: (next: PersonState) => void;
  fields: RegistrationField[];
  idPrefix: string;
}) {
  const set = (patch: Partial<PersonState>) => onChange({ ...person, ...patch });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-name`} className={label}>
            Full Name
            <Required />
          </label>
          <input
            id={`${idPrefix}-name`}
            type="text"
            required
            value={person.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="e.g. Alex Kumar"
            autoComplete="name"
            className={input}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-gender`} className={label}>
            Gender
            <Required />
          </label>
          <select
            id={`${idPrefix}-gender`}
            required
            value={person.gender}
            onChange={(e) => set({ gender: e.target.value })}
            className={`${input} cursor-pointer`}
          >
            <option value="">Select…</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-roll`} className={label}>
            Roll Number
            <Required />
          </label>
          <input
            id={`${idPrefix}-roll`}
            type="text"
            inputMode="numeric"
            required
            pattern="\d{5,6}"
            title="5 or 6 digits"
            value={person.rollNo}
            onChange={(e) => set({ rollNo: e.target.value.trim() })}
            placeholder="e.g. 2312345"
            className={input}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-phone`} className={label}>
            Mobile Number
            <Required />
          </label>
          <input
            id={`${idPrefix}-phone`}
            type="tel"
            required
            value={person.contactNo}
            onChange={(e) => set({ contactNo: e.target.value })}
            placeholder="10-digit number"
            autoComplete="tel"
            className={input}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-email`} className={label}>
          Email Address
          <Required />
        </label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          required
          value={person.email}
          onChange={(e) => set({ email: e.target.value })}
          placeholder="alex@example.com"
          autoComplete="email"
          className={input}
        />
      </div>

      {fields.map((f) => (
        <AnswerField
          key={f.id}
          id={`${idPrefix}-${f.id}`}
          field={f}
          value={person.dynamic[f.name]}
          onChange={(v) => set({ dynamic: { ...person.dynamic, [f.name]: v } })}
        />
      ))}
    </div>
  );
}

interface EventRegisterClientProps {
  event: PublicEvent;
}

export default function EventRegisterClient({ event }: EventRegisterClientProps) {
  const reg = event.registration;
  const isTeam = reg.type === "team";
  const useCustom = reg.useCustomForm;
  const googleForm =
    reg.googleFormLink && (reg.forceGoogleForm || !reg.useCustomForm) ? reg.googleFormLink : null;

  const [person, setPerson] = useState<PersonState>(emptyPerson);
  const [teamName, setTeamName] = useState("");
  const [teamAnswers, setTeamAnswers] = useState<Answers>({});
  const [members, setMembers] = useState<PersonState[]>(() =>
    Array.from({ length: Math.max(1, reg.teamMinSize) }, emptyPerson)
  );
  const [leaderIndex, setLeaderIndex] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Registered | null>(null);

  const eventFields = useCustom ? reg.fields : [];
  const memberFields = useCustom ? reg.participantFields : [];
  const where = [event.locationTitle, event.locationSubtitle].filter(Boolean).join(", ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const body = isTeam
      ? {
          team: { teamName, dynamic: teamAnswers },
          participants: members,
          leaderIndex,
        }
      : person;

    try {
      const res = await api<{
        registration: { registrationId: string; name?: string };
        whatsappGroupLink: string | null;
      }>(`/api/events/${event.id}/register`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setDone({
        registrationId: res.registration.registrationId,
        name: res.registration.name ?? person.name,
        whatsappGroupLink: res.whatsappGroupLink,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(detailedErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const updateMember = (index: number, next: PersonState) =>
    setMembers((prev) => prev.map((m, i) => (i === index ? next : m)));

  const removeMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
    setLeaderIndex((cur) => (cur === index ? 0 : cur > index ? cur - 1 : cur));
  };

  return (
    <div className="relative min-h-screen bg-[#080809] text-white selection:bg-white selection:text-black overflow-x-clip">
      <Navbar />

      {/* Ambient Blurred Header Backdrop */}
      <div className="absolute top-0 inset-x-0 h-[480px] overflow-hidden pointer-events-none select-none z-0">
        <Image
          src={event.image}
          alt={event.title}
          fill
          priority
          unoptimized={event.image.startsWith("http")}
          className="object-cover blur-3xl scale-125 opacity-30"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-[#080809]/85 to-[#080809]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pt-28 sm:pt-32 pb-24">
        <div className="mb-8">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-sm font-medium text-white transition-all shadow-sm group"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5] transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Event Details</span>
          </Link>
        </div>

        {done ? (
          /* Success */
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-xl shadow-emerald-500/10">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                You&apos;re registered!
              </h1>
              <p className="mt-2 text-neutral-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                {isTeam ? `Team ${done.name} is` : "You're"} signed up for{" "}
                <span className="text-white font-semibold">{event.title}</span>.
              </p>
            </div>

            <div className="w-full max-w-xl rounded-3xl bg-[#141417] border border-white/15 shadow-2xl p-6 sm:p-8 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Your registration ID
              </span>
              <p className="mt-2 font-mono text-3xl sm:text-4xl font-bold text-emerald-400 tracking-wider select-all">
                {done.registrationId}
              </p>
              <p className="mt-3 text-xs text-neutral-400 leading-relaxed">
                Take a screenshot or note this down. You&apos;ll need it, or your roll number, at
                the check-in desk.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs text-left">
                <div>
                  <span className="text-neutral-500 block">Date</span>
                  <span className="font-semibold text-white text-sm mt-0.5 block">
                    {event.month} {event.day}, {event.year}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Time</span>
                  <span className="font-semibold text-white text-sm mt-0.5 block">{event.time}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Venue</span>
                  <span className="font-semibold text-white text-sm mt-0.5 block">
                    {event.locationTitle}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                {done.whatsappGroupLink && (
                  <a
                    href={done.whatsappGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Join WhatsApp Group</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
                <Link
                  href={`/events/${event.id}`}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-white/10 hover:border-white/20 bg-neutral-900/60 text-neutral-300 hover:text-white text-xs font-medium text-center transition-colors"
                >
                  Event Details
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: event summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 self-start flex flex-col gap-6 z-10">
              <div className="rounded-3xl bg-[#121214] border border-white/10 p-6 sm:p-7 shadow-xl overflow-hidden relative">
                <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    priority
                    unoptimized={event.image.startsWith("http")}
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3.5 left-3.5">
                    <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-neutral-200 border border-white/15">
                      {event.tag}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col">
                  <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                    {event.title}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-400 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 pt-5 border-t border-white/10 text-xs sm:text-sm text-neutral-300">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>
                      {event.month} {event.day}, {event.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{where}</span>
                  </div>
                  {isTeam && (
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>
                        Team event · {reg.teamMinSize}
                        {reg.teamMaxSize !== reg.teamMinSize ? `–${reg.teamMaxSize}` : ""} members
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: form, a Google Form link, or a closed notice */}
            <div className="lg:col-span-7">
              {!event.registrationOpen ? (
                <div className="p-6 sm:p-9 rounded-3xl bg-[#121214] border border-white/10 shadow-2xl text-center">
                  <h1 className="text-2xl font-bold text-white tracking-tight">Registration closed</h1>
                  <p className="text-sm text-neutral-400 mt-2">
                    This event is no longer taking registrations.
                  </p>
                  <Link
                    href="/events"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-white hover:bg-neutral-200 text-black text-sm font-semibold px-6 py-3 transition-colors"
                  >
                    See other events
                  </Link>
                </div>
              ) : googleForm ? (
                <div className="p-6 sm:p-9 rounded-3xl bg-[#121214] border border-white/10 shadow-2xl text-center">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Register for {event.title}
                  </h1>
                  <p className="text-sm text-neutral-400 mt-2">
                    This event takes registrations through a Google Form.
                  </p>
                  <a
                    href={googleForm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-white hover:bg-neutral-200 text-black text-sm font-semibold px-6 py-3 transition-colors"
                  >
                    <span>Open the form</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-6 p-6 sm:p-9 rounded-3xl bg-[#121214] border border-white/10 shadow-2xl"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isTeam ? "Team Registration" : "Event Registration"}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {isTeam ? "Register your team" : "Register for this event"}
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                      Fill in your details to secure your spot.
                    </p>
                  </div>

                  {isTeam ? (
                    <>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="team-name" className={label}>
                          Team Name
                          <Required />
                        </label>
                        <input
                          id="team-name"
                          type="text"
                          required
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. Null Pointers"
                          className={input}
                        />
                      </div>

                      {eventFields.map((f) => (
                        <AnswerField
                          key={f.id}
                          id={`team-${f.id}`}
                          field={f}
                          value={teamAnswers[f.name]}
                          onChange={(v) => setTeamAnswers((prev) => ({ ...prev, [f.name]: v }))}
                        />
                      ))}

                      {members.map((m, i) => (
                        <fieldset
                          key={i}
                          className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/2 p-5"
                        >
                          <legend className="px-2 text-xs font-bold text-white">
                            Member {i + 1}
                            {i === leaderIndex ? " · Leader" : ""}
                          </legend>

                          <PersonFields
                            person={m}
                            onChange={(next) => updateMember(i, next)}
                            fields={memberFields}
                            idPrefix={`member-${i}`}
                          />

                          <div className="flex items-center justify-between gap-3">
                            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                              <input
                                type="radio"
                                name="leader"
                                checked={i === leaderIndex}
                                onChange={() => setLeaderIndex(i)}
                                className="accent-white cursor-pointer"
                              />
                              <span>Team leader</span>
                            </label>
                            {members.length > Math.max(1, reg.teamMinSize) && (
                              <button
                                type="button"
                                onClick={() => removeMember(i)}
                                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                        </fieldset>
                      ))}

                      {members.length < reg.teamMaxSize && (
                        <button
                          type="button"
                          onClick={() => setMembers((prev) => [...prev, emptyPerson()])}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 hover:border-white/40 py-3 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add a team member</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <PersonFields
                      person={person}
                      onChange={setPerson}
                      fields={eventFields}
                      idPrefix="person"
                    />
                  )}

                  {error && (
                    <p
                      role="alert"
                      className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 w-full py-4 px-6 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all duration-200 shadow-xl shadow-white/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{submitting ? "Registering…" : "Confirm Registration"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
