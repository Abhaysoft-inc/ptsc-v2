"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  Send,
} from "lucide-react";
import {
  AdminEvent,
  MailLog,
  MailStatus,
  MailType,
  Registration,
} from "@/lib/dashboard";
import StaggerList from "@/components/motion/StaggerList";
import PillTabs from "@/components/dashboard/PillTabs";

const STATUS_FILTERS = ["All", "Sent", "Pending", "Failed"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

interface AdminMailViewProps {
  events: AdminEvent[];
  registrations: Registration[];
  logs: MailLog[];
  onSend: (
    eventId: string,
    type: MailType
  ) => { queued: number; skipped: number };
  onResend: (logId: string) => void;
  eventId: string;
  onEventChange: (eventId: string) => void;
}

const ACTIONS: {
  type: MailType;
  title: string;
  description: string;
  button: string;
  icon: typeof Mail;
  chip: string;
  primary: boolean;
  confirm: string;
}[] = [
  {
    type: "Participation",
    title: "Participation Emails",
    description: "Send a thank-you email to everyone marked present.",
    button: "Send Emails",
    icon: Mail,
    chip: "bg-blue-500/10 text-blue-400",
    primary: true,
    confirm: "Send participation emails to all present attendees?",
  },
  {
    type: "Certificate",
    title: "Certificates",
    description: "Send participation certificates to everyone marked present.",
    button: "Send Certificates",
    icon: FileText,
    chip: "bg-purple-500/10 text-purple-400",
    primary: false,
    confirm: "Send certificates to all present attendees?",
  },
];

const STATUS_STYLE: Record<MailStatus, { label: string; tone: string }> = {
  sent: { label: "Sent", tone: "text-emerald-400" },
  pending: { label: "Pending", tone: "text-amber-400" },
  failed: { label: "Failed", tone: "text-red-400" },
};

function StatusIcon({ status }: { status: MailStatus }) {
  if (status === "sent")
    return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === "failed")
    return <AlertCircle className="w-4 h-4 text-red-400" />;
  return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />;
}

export default function AdminMailView({
  events,
  registrations,
  logs,
  onSend,
  onResend,
  eventId,
  onEventChange,
}: AdminMailViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [notice, setNotice] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  // Everyone who would receive an email: each team member, or the registrant.
  const recipientCount = registrations
    .filter((r) => r.eventId === eventId && !r.deleted && r.attended)
    .reduce(
      (sum, r) =>
        sum + (r.type === "team" && r.participants?.length ? r.participants.length : 1),
      0
    );

  const eventLogs = logs.filter((l) => l.eventId === eventId);
  const visibleLogs = eventLogs.filter(
    (l) => statusFilter === "All" || STATUS_STYLE[l.status].label === statusFilter
  );

  const handleSend = (action: (typeof ACTIONS)[number]) => {
    if (recipientCount === 0) {
      setNotice({
        ok: false,
        message:
          "No one is marked present for this event yet. Take attendance first.",
      });
      return;
    }
    if (!window.confirm(action.confirm)) return;

    const { queued, skipped } = onSend(eventId, action.type);
    setNotice(
      queued === 0
        ? {
            ok: false,
            message: `Everyone has already been sent ${action.type.toLowerCase()} emails.`,
          }
        : {
            ok: true,
            message: `${queued} ${action.type.toLowerCase()} email${queued === 1 ? "" : "s"} queued${
              skipped > 0 ? `, ${skipped} skipped (already sent)` : ""
            }.`,
          }
    );
  };

  return (
    <StaggerList className="space-y-6">
      {/* Event picker */}
      <label className="flex items-center gap-3 text-xs text-neutral-400 w-fit max-w-full">
        <CalendarDays className="w-4 h-4 shrink-0" />
        <select
          value={eventId}
          onChange={(e) => {
            onEventChange(e.target.value);
            setNotice(null);
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

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.type}
              className="p-6 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all flex flex-col"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {action.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <div className={`p-3 rounded-xl shrink-0 ${action.chip}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <p className="text-[11px] text-neutral-500 font-mono mt-4 flex-1">
                {recipientCount} {recipientCount === 1 ? "recipient" : "recipients"} marked
                present
              </p>

              <button
                type="button"
                onClick={() => handleSend(action)}
                className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  action.primary
                    ? "bg-white hover:bg-neutral-200 text-black shadow-md"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{action.button}</span>
              </button>
            </div>
          );
        })}
      </div>

      {notice && (
        <div
          role="status"
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs ${
            notice.ok
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}
        >
          {notice.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {/* Email logs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Email Logs
            <span className="ml-2 text-xs font-normal text-neutral-500 font-mono">
              {eventLogs.length}
            </span>
          </h3>
          <PillTabs
            label="Filter emails by status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        {visibleLogs.length > 0 ? (
          <div className="bg-[#111113] border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.08] text-neutral-500 text-xs font-medium">
                  <tr>
                    <th className="py-3.5 px-5">Recipient</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Time</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {visibleLogs.map((log) => {
                    const style = STATUS_STYLE[log.status];
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <p className="font-semibold text-white">
                            {log.recipientEmail}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {log.recipientName}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-white/5 text-neutral-300 border border-white/10">
                            {log.emailType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon status={log.status} />
                            <span className={style.tone}>{style.label}</span>
                          </div>
                          {log.error && (
                            <p className="text-[11px] text-red-400 mt-1 max-w-[14rem] truncate">
                              {log.error}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                          {log.createdAt}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {log.status === "failed" && (
                            <button
                              type="button"
                              onClick={() => onResend(log.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
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
          </div>
        ) : (
          <div className="text-center py-16 bg-[#111113] rounded-2xl border border-white/10">
            <Mail className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">
              {eventLogs.length === 0
                ? "No emails sent for this event"
                : "No emails match this filter"}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              {eventLogs.length === 0
                ? "Send participation emails or certificates to see delivery here."
                : "Try a different status."}
            </p>
          </div>
        )}
      </div>
    </StaggerList>
  );
}
