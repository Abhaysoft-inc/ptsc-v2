"use client";

import { Fragment, useState } from "react";
import {
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Download,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  AdminEvent,
  Registration,
  formatRegistrationId as formatRegId,
} from "@/lib/dashboard";
import StaggerList from "@/components/motion/StaggerList";
import PillTabs from "@/components/dashboard/PillTabs";

const STATUS_TABS = ["Active", "Trash"] as const;

interface AdminRegistrationsViewProps {
  events: AdminEvent[];
  registrations: Registration[];
  canManage: boolean;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  eventId: string;
  onEventChange: (eventId: string) => void;
}

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export default function AdminRegistrationsView({
  events,
  registrations,
  canManage,
  onDelete,
  onRestore,
  eventId,
  onEventChange,
}: AdminRegistrationsViewProps) {
  const [showTrash, setShowTrash] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = registrations.filter(
    (r) => r.eventId === eventId && r.deleted === showTrash
  );
  const eventTitle = events.find((e) => e.id === eventId)?.title ?? "event";
  const selectedIds = rows.filter((r) => selected.has(r.id)).map((r) => r.id);
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  const toggleSelected = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));

  const applyToSelected = () => {
    selectedIds.forEach(showTrash ? onRestore : onDelete);
    setSelected(new Set());
  };

  const toggleRow = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    const header = [
      "RegistrationID",
      "Type",
      "TeamName",
      "Participant",
      "Leader",
      "RollNo",
      "Email",
      "Contact",
      "Submitted",
    ];
    const lines = [header];

    for (const r of rows) {
      const id = formatRegId(r, events);
      if (r.type === "team" && r.participants?.length) {
        r.participants.forEach((p, i) =>
          lines.push([
            id,
            "team",
            r.teamName ?? "",
            p.name,
            i === 0 ? "Yes" : "No",
            p.rollNo,
            p.email,
            i === 0 ? r.contactNo : "",
            r.createdAt,
          ])
        );
      } else {
        lines.push([id, r.type, "", r.name, "", r.rollNo, r.email, r.contactNo, r.createdAt]);
      }
    }

    const csv = lines.map((line) => line.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${eventTitle.replace(/\W+/g, "-").toLowerCase()}-registrations.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <StaggerList className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={eventId}
            onChange={(e) => {
              onEventChange(e.target.value);
              setExpanded(new Set());
              setSelected(new Set());
            }}
            className="px-3.5 py-2 bg-[#121215] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer max-w-full"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>

          <PillTabs
            label="Registration status"
            options={STATUS_TABS}
            value={showTrash ? "Trash" : "Active"}
            onChange={(tab) => {
              setShowTrash(tab === "Trash");
              setSelected(new Set());
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={rows.length === 0}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Export CSV</span>
        </button>
      </div>

      {canManage && selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-lime-400/10 border border-lime-400/20 text-xs">
          <span className="text-lime-300 font-medium">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={applyToSelected}
              className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              {showTrash ? "Restore" : "Move to trash"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {rows.length > 0 ? (
        <div className="bg-[#111113] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] text-neutral-500 text-xs font-medium">
                <tr>
                  {canManage && (
                    <th className="py-3.5 pl-5 pr-0 w-8">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        aria-label="Select all registrations"
                        className="w-4 h-4 rounded accent-lime-400 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="py-3.5 px-5">Registration</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Lead</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  {canManage && <th className="py-3.5 px-5 text-right">Actions</th>}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {rows.map((reg) => {
                  const isTeam = reg.type === "team";
                  const isOpen = expanded.has(reg.id);

                  return (
                    <Fragment key={reg.id}>
                      <tr
                        onClick={isTeam ? () => toggleRow(reg.id) : undefined}
                        className={`transition-colors ${
                          selected.has(reg.id)
                            ? "bg-white/[0.05]"
                            : "hover:bg-white/[0.02]"
                        } ${isTeam ? "cursor-pointer" : ""}`}
                      >
                        {canManage && (
                          <td
                            className="py-3.5 pl-5 pr-0 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selected.has(reg.id)}
                              onChange={() => toggleSelected(reg.id)}
                              aria-label={`Select ${formatRegId(reg, events)}`}
                              className="w-4 h-4 rounded accent-lime-400 cursor-pointer"
                            />
                          </td>
                        )}
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
                            <div>
                              <p className="font-mono font-semibold text-white">
                                {formatRegId(reg, events)}
                              </p>
                              {isTeam && (
                                <p className="text-[11px] text-neutral-400">
                                  {reg.teamName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                              isTeam
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                            }`}
                          >
                            {reg.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-white">{reg.name}</p>
                          <p className="text-[11px] text-neutral-400">{reg.rollNo}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-neutral-300">{reg.email}</p>
                          <p className="text-[11px] text-neutral-400">{reg.contactNo}</p>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                          {reg.createdAt}
                        </td>
                        {canManage && (
                          <td className="py-3.5 px-5 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (reg.deleted) onRestore(reg.id);
                                else onDelete(reg.id);
                              }}
                              title={reg.deleted ? "Restore" : "Move to trash"}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                reg.deleted
                                  ? "text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                                  : "text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                              }`}
                            >
                              {reg.deleted ? (
                                <Undo2 className="w-4 h-4" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        )}
                      </tr>

                      {isTeam && isOpen && (
                        <tr className="bg-[#0d0d10]">
                          <td colSpan={canManage ? 7 : 5} className="px-5 py-4">
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
          <ClipboardList className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">
            {showTrash ? "Trash is empty" : "No registrations yet"}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            {showTrash
              ? "Deleted registrations for this event show up here."
              : "Registrations for this event will appear here."}
          </p>
        </div>
      )}
    </StaggerList>
  );
}
