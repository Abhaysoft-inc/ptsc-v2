"use client";

import { Fragment, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Save,
  ScanLine,
  Search,
  Users,
  X,
} from "lucide-react";
import {
  AdminEvent,
  Registration,
  formatRegistrationId,
} from "@/lib/dashboard";
import StaggerList from "@/components/motion/StaggerList";
import PillTabs from "@/components/dashboard/PillTabs";

const STATUS_FILTERS = ["All", "Present", "Absent"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

interface AdminAttendanceViewProps {
  events: AdminEvent[];
  registrations: Registration[];
  onSave: (updates: Record<string, boolean>) => void;
  eventId: string;
  onEventChange: (eventId: string) => void;
}

export default function AdminAttendanceView({
  events,
  registrations,
  onSave,
  eventId,
  onEventChange,
}: AdminAttendanceViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deskInput, setDeskInput] = useState("");
  const [deskNotice, setDeskNotice] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  // Unsaved edits only: registration id -> present. Kept across event
  // switches so nothing is lost; Save applies all of them.
  const [draft, setDraft] = useState<Record<string, boolean>>({});

  const eventRegs = registrations.filter(
    (r) => r.eventId === eventId && !r.deleted
  );

  const isPresent = (r: Registration) => draft[r.id] ?? r.attended;

  const total = eventRegs.length;
  const present = eventRegs.filter(isPresent).length;
  const absent = total - present;
  const turnout = Math.round((present / (total || 1)) * 100);

  const unsavedCount = Object.entries(draft).filter(
    ([id, value]) => registrations.find((r) => r.id === id)?.attended !== value
  ).length;

  const query = search.trim().toLowerCase();
  const visible = eventRegs.filter((r) => {
    if (statusFilter === "Present" && !isPresent(r)) return false;
    if (statusFilter === "Absent" && isPresent(r)) return false;
    if (!query) return true;
    const haystack = [
      r.name,
      r.email,
      r.rollNo,
      r.teamName ?? "",
      formatRegistrationId(r, events),
      ...(r.participants ?? []).flatMap((p) => [p.name, p.rollNo]),
    ];
    return haystack.some((value) => value.toLowerCase().includes(query));
  });

  const setPresent = (id: string, value: boolean) =>
    setDraft((prev) => ({ ...prev, [id]: value }));

  const markAllVisible = (value: boolean) =>
    setDraft((prev) => {
      const next = { ...prev };
      visible.forEach((r) => {
        next[r.id] = value;
      });
      return next;
    });

  const toggleRow = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleSave = () => {
    const updates: Record<string, boolean> = {};
    Object.entries(draft).forEach(([id, value]) => {
      if (registrations.find((r) => r.id === id)?.attended !== value) {
        updates[id] = value;
      }
    });
    onSave(updates);
    setDraft({});
  };

  // Desk check-in: match this event's registrations by registration ID or by
  // roll number of the lead or any team member.
  const handleDeskCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const code = deskInput.trim().toLowerCase();
    if (!code) return;

    const match = eventRegs.find(
      (r) =>
        formatRegistrationId(r, events).toLowerCase() === code ||
        r.rollNo.toLowerCase() === code ||
        r.participants?.some((p) => p.rollNo.toLowerCase() === code)
    );

    if (!match) {
      setDeskNotice({
        ok: false,
        message: `No registration matches “${deskInput.trim()}” for this event.`,
      });
    } else {
      setPresent(match.id, true);
      setDeskNotice({
        ok: true,
        message: `${match.teamName ?? match.name} marked present. Save to confirm.`,
      });
      setDeskInput("");
    }
  };

  const stats = [
    { label: "Total Registered", value: total, tone: "text-white", icon: Users, chip: "bg-blue-500/10 text-blue-400" },
    { label: "Present", value: present, tone: "text-emerald-400", icon: Check, chip: "bg-emerald-500/10 text-emerald-400" },
    { label: "Absent", value: absent, tone: "text-red-400", icon: X, chip: "bg-red-500/10 text-red-400" },
  ];

  return (
    <StaggerList className="space-y-6">
      {/* Event picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-xs text-neutral-400">
          <CalendarDays className="w-4 h-4 shrink-0" />
          <select
            value={eventId}
            onChange={(e) => {
              onEventChange(e.target.value);
              setExpanded(new Set());
              setDeskNotice(null);
            }}
            className="px-3.5 py-2.5 bg-[#121215] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer min-w-[16rem] max-w-full"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-3">
          {unsavedCount > 0 && (
            <span className="text-xs text-amber-400 font-mono">
              {unsavedCount} unsaved
            </span>
          )}
          {unsavedCount > 0 && (
            <button
              type="button"
              onClick={() => setDraft({})}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={unsavedCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, tone, icon: Icon, chip }) => (
          <div
            key={label}
            className="p-5 rounded-2xl bg-[#111113] border border-white/10 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-neutral-400">{label}</p>
              <p className={`text-3xl font-semibold font-mono mt-1 ${tone}`}>
                {value}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${chip}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>Turnout</span>
            <span className="text-emerald-400">{turnout}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${turnout}%` }}
            />
          </div>
        </div>
      )}

      {/* Desk check-in */}
      <form
        onSubmit={handleDeskCheckIn}
        className="p-4 rounded-2xl bg-[#111113] border border-white/10 space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={deskInput}
              onChange={(e) => setDeskInput(e.target.value)}
              placeholder="Quick check-in: registration ID or roll no. (e.g. HF-REG3)"
              className="w-full pl-10 pr-4 py-2.5 bg-[#18181b] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-white/30"
            />
          </div>
          <button
            type="submit"
            disabled={total === 0}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mark Present
          </button>
        </div>
        {deskNotice && (
          <p
            role="status"
            className={`text-xs ${deskNotice.ok ? "text-emerald-400" : "text-red-400"}`}
          >
            {deskNotice.message}
          </p>
        )}
      </form>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, team, roll no., or ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#121215] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PillTabs
            label="Filter by attendance"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <button
            type="button"
            onClick={() => markAllVisible(true)}
            disabled={visible.length === 0}
            className="px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mark all present
          </button>
        </div>
      </div>

      {/* Attendees */}
      {visible.length > 0 ? (
        <div className="bg-[#111113] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] text-neutral-500 text-xs font-medium">
                <tr>
                  <th className="py-3.5 px-5">Registration</th>
                  <th className="py-3.5 px-4">Name / Team</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4 text-center">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {visible.map((reg) => {
                  const isTeam = reg.type === "team";
                  const isOpen = expanded.has(reg.id);
                  const here = isPresent(reg);
                  const dirty = draft[reg.id] !== undefined && draft[reg.id] !== reg.attended;

                  return (
                    <Fragment key={reg.id}>
                      <tr
                        onClick={isTeam ? () => toggleRow(reg.id) : undefined}
                        className={`transition-colors hover:bg-white/[0.02] ${
                          isTeam ? "cursor-pointer" : ""
                        }`}
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            {isTeam ? (
                              isOpen ? (
                                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                              )
                            ) : (
                              <span className="w-3.5" />
                            )}
                            <span className="font-mono font-semibold text-white">
                              {formatRegistrationId(reg, events)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-white">
                            {isTeam ? reg.teamName ?? reg.name : reg.name}
                          </p>
                          <p className="text-[11px] text-neutral-400">{reg.email}</p>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-400 space-y-0.5">
                          {isTeam && (
                            <p>
                              <span className="text-neutral-500">Leader:</span> {reg.name}
                            </p>
                          )}
                          <p>
                            <span className="text-neutral-500">Roll:</span> {reg.rollNo}
                          </p>
                          <p>
                            <span className="text-neutral-500">Contact:</span> {reg.contactNo}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPresent(reg.id, !here);
                              }}
                              aria-pressed={here}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                here
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : "bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white"
                              } ${dirty ? "ring-1 ring-amber-400/50" : ""}`}
                            >
                              {here ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <X className="w-3.5 h-3.5" />
                              )}
                              <span>{here ? "Present" : "Absent"}</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isTeam && isOpen && (
                        <tr className="bg-[#0d0d10]">
                          <td colSpan={4} className="px-5 py-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                              Team members
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {reg.participants?.map((p, i) => (
                                <div
                                  key={p.email}
                                  className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]"
                                >
                                  <p className="font-semibold text-white">
                                    {p.name}
                                    {i === 0 && (
                                      <span className="ml-2 text-[10px] font-mono text-amber-400">
                                        LEADER
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-neutral-400">
                                    {p.rollNo} · {p.email}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-[#111113] rounded-2xl border border-white/10">
          <Users className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">
            {total === 0 ? "No registrations for this event" : "No attendees match"}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            {total === 0
              ? "Attendance can be taken once people have registered."
              : "Try a different search or filter."}
          </p>
        </div>
      )}
    </StaggerList>
  );
}
