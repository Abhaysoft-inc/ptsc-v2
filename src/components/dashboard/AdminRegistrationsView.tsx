"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, ClipboardList, Download, Trash2, Undo2 } from "lucide-react";
import type { PageInfo, RegistrationPerson, RegistrationRow } from "@/lib/types/admin";
import PillTabs from "@/components/dashboard/PillTabs";
import Pagination from "@/components/dashboard/Pagination";
import { EmptyBlock, SearchInput } from "@/components/dashboard/ListStates";

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

interface AdminRegistrationsViewProps {
  rows: RegistrationRow[];
  pageInfo: PageInfo;
  loading: boolean;
  trash: boolean;
  onTrashChange: (trash: boolean) => void;
  trashCount: number;
  activeCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  /** Only admins may trash or restore. */
  canManage: boolean;
  /** Moves to trash, or restores when viewing the trash. Resolves true on success. */
  onApply: (ids: string[]) => Promise<boolean>;
  exportHref: string;
}

function PersonLine({ p }: { p: RegistrationPerson }) {
  return (
    <p className="text-[11px] text-neutral-400">
      {[p.rollNo, p.branch, p.year ? `Year ${p.year}` : "", p.email, p.contactNo]
        .filter(Boolean)
        .join(" · ")}
    </p>
  );
}

function Answers({ details }: { details: Record<string, string> }) {
  const entries = Object.entries(details);
  if (entries.length === 0) return null;
  return (
    <dl className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
      {entries.map(([k, v]) => (
        <div key={k} className="min-w-0 text-[11px]">
          <dt className="inline text-neutral-500">{k}: </dt>
          <dd className="inline text-neutral-300 break-words">
            {/^https?:\/\//.test(v) ? (
              <a
                href={v}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                Open link
              </a>
            ) : (
              v
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function AdminRegistrationsView({
  rows,
  pageInfo,
  loading,
  trash,
  onTrashChange,
  trashCount,
  activeCount,
  search,
  onSearchChange,
  onPageChange,
  canManage,
  onApply,
  exportHref,
}: AdminRegistrationsViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  // Only rows on this page can be selected; drop any that left the page.
  const selectedIds = rows.filter((r) => selected.has(r.id)).map((r) => r.id);
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  const apply = async (ids: string[]) => {
    const verb = trash ? "Restore" : "Move to trash";
    const what = ids.length === 1 ? "this registration" : `${ids.length} registrations`;
    if (!window.confirm(`${verb} ${what}?`)) return;
    setBusy(true);
    try {
      if (await onApply(ids)) setSelected(new Set());
    } finally {
      setBusy(false);
    }
  };

  const activeLabel = `Active (${activeCount})`;
  const trashLabel = `Trash (${trashCount})`;
  const columns = canManage ? 7 : 6;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search name, roll no., email, team or ID..."
        />
        <div className="flex flex-wrap items-center gap-3">
          <PillTabs
            label="Registration status"
            options={[activeLabel, trashLabel]}
            value={trash ? trashLabel : activeLabel}
            onChange={(v) => {
              setSelected(new Set());
              onTrashChange(v === trashLabel);
            }}
          />
          <a
            href={exportHref}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition-all"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {canManage && selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-lime-400/10 border border-lime-400/20 text-xs">
          <span className="text-lime-300 font-medium">{selectedIds.length} selected</span>
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
              onClick={() => apply(selectedIds)}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              {trash ? "Restore" : "Move to trash"}
            </button>
          </div>
        </div>
      )}

      {rows.length > 0 ? (
        <div
          aria-busy={loading}
          className={`overflow-x-auto transition-opacity ${
            loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.08] text-neutral-500 text-xs font-medium">
              <tr>
                {canManage && (
                  <th className="py-3.5 pr-3 w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() =>
                        setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))
                      }
                      aria-label="Select all on this page"
                      className="w-4 h-4 rounded accent-lime-400 cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-3.5 pr-4">Registration ID</th>
                <th className="py-3.5 px-4">Name / Team</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-4">Attended</th>
                <th className="py-3.5 px-4">Submitted</th>
                {canManage && <th className="py-3.5 pl-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((reg) => {
                const isTeam = reg.type === "team";
                const hasMore = isTeam || Object.keys(reg.details).length > 0;
                const isOpen = expanded.has(reg.id);
                const isSelected = selected.has(reg.id);

                return (
                  <Fragment key={reg.id}>
                    <tr
                      onClick={hasMore ? () => setExpanded((s) => toggle(s, reg.id)) : undefined}
                      className={`transition-colors ${
                        isSelected ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"
                      } ${hasMore ? "cursor-pointer" : ""}`}
                    >
                      {canManage && (
                        <td className="py-3.5 pr-3 w-8" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setSelected((s) => toggle(s, reg.id))}
                            aria-label={`Select ${reg.registrationId}`}
                            className="w-4 h-4 rounded accent-lime-400 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          {hasMore ? (
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
                        <p className="font-semibold text-white">
                          {isTeam ? reg.teamName : reg.lead.name}
                        </p>
                        {isTeam && (
                          <p className="text-[11px] text-neutral-400">
                            Team of {reg.participants.length} · led by {reg.lead.name}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <PersonLine p={reg.lead} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                            reg.attended
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-white/5 text-neutral-400 border-white/10"
                          }`}
                        >
                          {reg.attended ? "Present" : "Absent"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                        {reg.createdAt ? DATE.format(new Date(reg.createdAt)) : "—"}
                      </td>
                      {canManage && (
                        <td className="py-3.5 pl-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              apply([reg.id]);
                            }}
                            disabled={busy}
                            title={trash ? "Restore" : "Move to trash"}
                            aria-label={trash ? "Restore" : "Move to trash"}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                              trash
                                ? "text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                                : "text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                            }`}
                          >
                            {trash ? <Undo2 className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </td>
                      )}
                    </tr>

                    {isOpen && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={columns} className="px-4 py-4">
                          {Object.keys(reg.details).length > 0 && (
                            <div className="mb-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                {isTeam ? "Team answers" : "Answers"}
                              </p>
                              <Answers details={reg.details} />
                            </div>
                          )}
                          {isTeam && (
                            <>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                                Team members
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {reg.participants.map((p, i) => (
                                  <div
                                    key={`${p.email}-${i}`}
                                    className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]"
                                  >
                                    <p className="font-semibold text-white">
                                      {p.name}
                                      {i === reg.leaderIndex && (
                                        <span className="ml-2 text-[10px] font-mono text-amber-400">
                                          LEADER
                                        </span>
                                      )}
                                    </p>
                                    <PersonLine p={p} />
                                    <Answers details={p.details} />
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
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
          icon={ClipboardList}
          title={search ? "No registrations match" : trash ? "Trash is empty" : "No registrations yet"}
          hint={
            search
              ? "Try a different search."
              : trash
                ? "Registrations moved to the trash show up here."
                : "Registrations for this event will appear here."
          }
        />
      )}

      <Pagination
        info={pageInfo}
        onPageChange={onPageChange}
        loading={loading}
        noun={["registration", "registrations"]}
      />
    </div>
  );
}
