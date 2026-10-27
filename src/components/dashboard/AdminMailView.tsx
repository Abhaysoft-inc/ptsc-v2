"use client";

import { AlertCircle, CheckCircle2, FileText, Info, Loader2, Mail, Send, Trophy } from "lucide-react";
import type { EmailStatus, EmailType, MailLogRow, MailSummary, PageInfo } from "@/lib/types/admin";
import PillTabs from "@/components/dashboard/PillTabs";
import Pagination from "@/components/dashboard/Pagination";
import { EmptyBlock, SearchInput } from "@/components/dashboard/ListStates";

export const MAIL_TYPE_FILTERS = ["All", "Registration", "Participation", "Certificate", "Results"] as const;
export type MailTypeFilter = (typeof MAIL_TYPE_FILTERS)[number];
export const MAIL_STATUS_FILTERS = ["All", "Sent", "Failed", "Pending"] as const;
export type MailStatusFilter = (typeof MAIL_STATUS_FILTERS)[number];

/** Filter label -> stored emailType. */
export const TYPE_VALUE: Record<Exclude<MailTypeFilter, "All">, EmailType> = {
  Registration: "registration",
  Participation: "participation",
  Certificate: "certificate",
  Results: "result_selected_members",
};

const TYPE_LABEL: Record<EmailType, string> = {
  registration: "Registration",
  participation: "Participation",
  certificate: "Certificate",
  result_selected_members: "Results",
};

const CARDS: { type: EmailType; title: string; icon: typeof Mail; chip: string }[] = [
  { type: "registration", title: "Registration", icon: Mail, chip: "bg-blue-500/10 text-blue-400" },
  { type: "participation", title: "Participation", icon: Send, chip: "bg-emerald-500/10 text-emerald-400" },
  { type: "certificate", title: "Certificates", icon: FileText, chip: "bg-purple-500/10 text-purple-400" },
  { type: "result_selected_members", title: "Results", icon: Trophy, chip: "bg-amber-500/10 text-amber-400" },
];

const STATUS_STYLE: Record<EmailStatus, { label: string; tone: string }> = {
  sent: { label: "Sent", tone: "text-emerald-400" },
  pending: { label: "Pending", tone: "text-amber-400" },
  failed: { label: "Failed", tone: "text-red-400" },
};

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function StatusIcon({ status }: { status: EmailStatus }) {
  if (status === "sent") return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
  if (status === "failed") return <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
  return <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />;
}

interface AdminMailViewProps {
  logs: MailLogRow[];
  summary: MailSummary;
  pageInfo: PageInfo;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: MailTypeFilter;
  onTypeFilterChange: (filter: MailTypeFilter) => void;
  statusFilter: MailStatusFilter;
  onStatusFilterChange: (filter: MailStatusFilter) => void;
  onPageChange: (page: number) => void;
}

export default function AdminMailView({
  logs,
  summary,
  pageInfo,
  loading,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  onPageChange,
}: AdminMailViewProps) {
  // Results emails only exist for a few events; hide the card when there are none.
  const cards = CARDS.filter(
    (c) => c.type !== "result_selected_members" || summary.result_selected_members.total > 0
  );

  return (
    <div className="space-y-6">
      {/* Delivery summary for the whole event */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ type, title, icon: Icon, chip }) => {
          const s = summary[type];
          return (
            <div key={type} className="p-5 rounded-2xl bg-[#111113] border border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-neutral-400">{title}</p>
                  <p className="text-3xl font-semibold font-mono text-white mt-1">{s.total}</p>
                </div>
                <div className={`p-3 rounded-xl ${chip}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="mt-3 text-[11px] font-mono flex flex-wrap gap-x-3">
                <span className="text-emerald-400">{s.sent} sent</span>
                <span className={s.failed ? "text-red-400" : "text-neutral-500"}>{s.failed} failed</span>
                {s.pending > 0 && <span className="text-amber-400">{s.pending} pending</span>}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sending is intentionally not wired up yet */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-neutral-400">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-neutral-300" />
        <p>
          Sending participation emails, certificates and resends isn&apos;t connected yet, so this page
          only shows delivery logs. Nothing here emails anyone.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <SearchInput value={search} onChange={onSearchChange} placeholder="Search recipient name or email..." />
        <div className="flex flex-wrap items-center gap-3">
          <PillTabs label="Filter by email type" options={MAIL_TYPE_FILTERS} value={typeFilter} onChange={onTypeFilterChange} />
          <PillTabs label="Filter by status" options={MAIL_STATUS_FILTERS} value={statusFilter} onChange={onStatusFilterChange} />
        </div>
      </div>

      {logs.length > 0 ? (
        <div
          aria-busy={loading}
          className={`overflow-x-auto transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.08] text-neutral-500 text-xs font-medium">
              <tr>
                <th className="py-3.5 pr-4">Recipient</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {logs.map((log) => {
                const style = STATUS_STYLE[log.status] ?? STATUS_STYLE.pending;
                const when = log.sentAt ?? log.createdAt;
                return (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold text-white">{log.recipientEmail}</p>
                      <p className="text-[11px] text-neutral-400">{log.recipientName}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/5 text-neutral-300 border border-white/10 whitespace-nowrap">
                        {TYPE_LABEL[log.emailType] ?? log.emailType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={log.status} />
                        <span className={style.tone}>{style.label}</span>
                        {log.retryCount > 0 && (
                          <span className="text-[11px] text-neutral-500">
                            · {log.retryCount} {log.retryCount === 1 ? "retry" : "retries"}
                          </span>
                        )}
                      </div>
                      {log.errorMessage && (
                        <p className="text-[11px] text-red-400 mt-1 max-w-[18rem] truncate" title={log.errorMessage}>
                          {log.errorMessage}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                      {when ? DATE.format(new Date(when)) : "—"}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      {log.status === "failed" && (
                        <button
                          type="button"
                          disabled
                          title="Sending isn't connected yet"
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-white/5 border border-white/10 opacity-40 cursor-not-allowed"
                        >
                          Resend
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyBlock
          icon={Mail}
          title={
            search || typeFilter !== "All" || statusFilter !== "All"
              ? "No emails match"
              : "No emails sent for this event"
          }
          hint={
            search || typeFilter !== "All" || statusFilter !== "All"
              ? "Try a different search or filter."
              : "Emails sent for this event will be logged here."
          }
        />
      )}

      <Pagination info={pageInfo} onPageChange={onPageChange} loading={loading} noun={["email", "emails"]} />
    </div>
  );
}
