"use client";

import { Fragment, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Save,
  ScanLine,
  Users,
  X,
} from "lucide-react";
import type { AttendanceCounts, PageInfo, RegistrationRow } from "@/lib/types/admin";
import PillTabs from "@/components/dashboard/PillTabs";
import Pagination from "@/components/dashboard/Pagination";
import { EmptyBlock, SearchInput } from "@/components/dashboard/ListStates";

export const ATTENDANCE_FILTERS = ["All", "Present", "Absent"] as const;
export type AttendanceFilter = (typeof ATTENDANCE_FILTERS)[number];

/** Unsaved marks: registration id -> present, plus what was saved before. */
export type AttendanceDraft = Record<string, { attended: boolean; saved: boolean }>;

interface AdminAttendanceViewProps {
  rows: RegistrationRow[];
  pageInfo: PageInfo;
  loading: boolean;
  /** Saved counts for the whole event. */
  counts: AttendanceCounts;
  draft: AttendanceDraft;
  onMark: (rows: RegistrationRow[], attended: boolean) => void;
  onDiscard: () => void;
  onSave: () => Promise<void>;
  saving: boolean;
  onCheckIn: (code: string) => Promise<{ ok: boolean; message: string }>;
  search: string;
  onSearchChange: (value: string) => void;
  filter: AttendanceFilter;
  onFilterChange: (filter: AttendanceFilter) => void;
  onPageChange: (page: number) => void;
}

export default function AdminAttendanceView({
  rows,
  pageInfo,
  loading,
  counts,
  draft,
  onMark,
  onDiscard,
  onSave,
  saving,
  onCheckIn,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onPageChange,
}: AdminAttendanceViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deskInput, setDeskInput] = useState("");
  const [deskBusy, setDeskBusy] = useState(false);
  const [deskNotice, setDeskNotice] = useState<{ ok: boolean; message: string } | null>(null);

  const isPresent = (r: RegistrationRow) => draft[r.id]?.attended ?? r.attended;
  const changes = Object.values(draft).filter((d) => d.attended !== d.saved);
  const unsaved = changes.length;
  // Live counts: saved totals adjusted by the unsaved marks.
  const present =
    counts.present +
    changes.reduce((n, d) => n + (d.attended ? 1 : -1), 0);
  const absent = counts.total - present;
  const turnout = Math.round((present / (counts.total || 1)) * 100);

  const handleDesk = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = deskInput.trim();
    if (!code) return;
    setDeskBusy(true);
    try {
      const result = await onCheckIn(code);
      setDeskNotice(result);
      if (result.ok) setDeskInput("");
    } finally {
      setDeskBusy(false);
    }
  };

  const stats = [
    { label: "Total Registered", value: counts.total, tone: "text-white", icon: Users, chip: "bg-blue-500/10 text-blue-400" },
    { label: "Present", value: present, tone: "text-emerald-400", icon: Check, chip: "bg-emerald-500/10 text-emerald-400" },
    { label: "Absent", value: absent, tone: "text-red-400", icon: X, chip: "bg-red-500/10 text-red-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, tone, icon: Icon, chip }) => (
          <div
            key={label}
            className="p-5 rounded-2xl bg-[#111113] border border-white/10 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-neutral-400">{label}</p>
              <p className={`text-3xl font-semibold font-mono mt-1 ${tone}`}>{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${chip}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {counts.total > 0 && (
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

      {/* Desk check-in: saves immediately */}
      <form onSubmit={handleDesk} className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={deskInput}
              onChange={(e) => setDeskInput(e.target.value)}
              placeholder="Quick check-in: registration ID or roll number"
              aria-label="Registration ID or roll number"
              className="w-full pl-10 pr-4 py-2.5 bg-[#121215] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-white/30"
            />
          </div>
          <button
            type="submit"
            disabled={deskBusy || !deskInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deskBusy ? "Checking…" : "Mark Present"}
          </button>
        </div>
        {deskNotice && (
          <p role="status" className={`text-xs ${deskNotice.ok ? "text-emerald-400" : "text-red-400"}`}>
            {deskNotice.message}
          </p>
        )}
      </form>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search name, roll no., team or ID..."
        />
        <div className="flex flex-wrap items-center gap-3">
          <PillTabs
            label="Filter by attendance"
            options={ATTENDANCE_FILTERS}
            value={filter}
            onChange={onFilterChange}
          />
          <button
            type="button"
            onClick={() => onMark(rows, true)}
            disabled={rows.length === 0 || loading}
            className="px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mark page present
          </button>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-end gap-3">
        {unsaved > 0 && (
          <>
            <span className="text-xs text-amber-400 font-mono">
              {unsaved} unsaved {unsaved === 1 ? "change" : "changes"}
            </span>
            <button
              type="button"
              onClick={onDiscard}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={unsaved === 0 || saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving…" : "Save Changes"}</span>
        </button>
      </div>

      {rows.length > 0 ? (
        <div
          aria-busy={loading}
          className={`overflow-x-auto transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.08] text-neutral-500 text-xs font-medium">
              <tr>
                <th className="py-3.5 pr-4">Registration ID</th>
                <th className="py-3.5 px-4">Name / Team</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 pl-4 text-center">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((reg) => {
                const isTeam = reg.type === "team";
                const isOpen = expanded.has(reg.id);
                const here = isPresent(reg);
                const dirty = draft[reg.id] !== undefined && draft[reg.id].attended !== draft[reg.id].saved;

                return (
                  <Fragment key={reg.id}>
                    <tr
                      onClick={
                        isTeam
                          ? () =>
                              setExpanded((s) => {
                                const next = new Set(s);
                                if (next.has(reg.id)) next.delete(reg.id);
                                else next.add(reg.id);
                                return next;
                              })
                          : undefined
                      }
                      className={`transition-colors hover:bg-white/[0.02] ${isTeam ? "cursor-pointer" : ""}`}
                    >
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          {isTeam ? (
                            isOpen ? (
                              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            )
                          ) : (
                            <span className="w-3.5 shrink-0" />
                          )}
                          <span className="font-mono font-semibold text-white whitespace-nowrap">
                            {reg.registrationId || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{isTeam ? reg.teamName : reg.lead.name}</p>
                        <p className="text-[11px] text-neutral-400">{reg.lead.email}</p>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400 space-y-0.5">
                        {isTeam && (
                          <p>
                            <span className="text-neutral-500">Leader:</span> {reg.lead.name} ·{" "}
                            {reg.participants.length} members
                          </p>
                        )}
                        <p>
                          <span className="text-neutral-500">Roll:</span> {reg.lead.rollNo || "—"}
                        </p>
                        <p>
                          <span className="text-neutral-500">Contact:</span> {reg.lead.contactNo || "—"}
                        </p>
                      </td>
                      <td className="py-3.5 pl-4">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMark([reg], !here);
                            }}
                            aria-pressed={here}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                              here
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-white/5 text-neutral-400 border-white/10 hover:bg-white/10 hover:text-white"
                            } ${dirty ? "ring-1 ring-amber-400/50" : ""}`}
                          >
                            {here ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            <span>{here ? "Present" : "Absent"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isTeam && isOpen && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={4} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {reg.participants.map((p, i) => (
                              <div
                                key={`${p.email}-${i}`}
                                className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]"
                              >
                                <p className="font-semibold text-white">
                                  {p.name}
                                  {i === reg.leaderIndex && (
                                    <span className="ml-2 text-[10px] font-mono text-amber-400">LEADER</span>
                                  )}
                                </p>
                                <p className="text-[11px] text-neutral-400">
                                  {[p.rollNo, p.email, p.contactNo].filter(Boolean).join(" · ")}
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
      ) : (
        <EmptyBlock
          icon={Users}
          title={counts.total === 0 ? "No registrations for this event" : "No attendees match"}
          hint={
            counts.total === 0
              ? "Attendance can be taken once people have registered."
              : "Try a different search or filter."
          }
        />
      )}

      <Pagination info={pageInfo} onPageChange={onPageChange} loading={loading} noun={["attendee", "attendees"]} />
    </div>
  );
}
