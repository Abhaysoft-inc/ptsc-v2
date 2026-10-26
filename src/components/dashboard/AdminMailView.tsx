"use client";

import { useState } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  FileText,
  RotateCcw,
} from "lucide-react";
import { MailCampaign, INITIAL_MAILS } from "@/lib/dashboard";

interface AdminMailViewProps {
  campaigns: MailCampaign[];
  onSendMail: (campaign: Omit<MailCampaign, "id" | "sentAt" | "openRate">) => void;
}

export default function AdminMailView({
  campaigns,
  onSendMail,
}: AdminMailViewProps) {
  const [recipientGroup, setRecipientGroup] = useState("HackFest Attendees (142)");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sentNotice, setSentNotice] = useState(false);

  const templates = [
    {
      title: "Pass Instructions",
      subject: "HackFest '26 Attendee Guide: QR Verification & Desk Entry",
      body: "Hello Builders,\n\nPlease have your digital PTSC QR badge ready on your mobile devices upon entering Auditorium Hall A. Check-in desks open promptly at 9:30 AM EST.\n\nBest,\nPTSC Organizers",
    },
    {
      title: "Venue Notification",
      subject: "Venue Location Confirmed: Campus Auditorium Hall A",
      body: "Hi Everyone,\n\nWe are confirming that tomorrow's hackathon will be hosted at Campus Auditorium Hall A with full hardware prototyping benches and gigabit ethernet.\n\nSee you there!",
    },
    {
      title: "Build Deadline",
      subject: "Final 2 Hours: Submit Your Campus Build to PTSC Registry",
      body: "Attention Teams,\n\nThe project submission portal closes at 3:00 PM EST sharp. Ensure your GitHub repo URL and live demo link are recorded in your dashboard.\n\nGood luck with the final polish!",
    },
  ];

  const applyTemplate = (t: typeof templates[0]) => {
    setSubject(t.subject);
    setBody(t.body);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    onSendMail({
      subject: subject.trim(),
      recipientGroup,
      recipientsCount: recipientGroup.includes("142") ? 142 : recipientGroup.includes("340") ? 340 : 45,
      status: "Delivered",
    });

    setSubject("");
    setBody("");
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* 1. Compose Broadcast Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/15 shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Campus Email Broadcast Composer
              </h3>
              <p className="text-xs text-neutral-400">
                Dispatch instant alerts, check-in instructions, and updates to campus builders.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>High-Priority Gateway</span>
          </div>
        </div>

        {/* Template Quick Chips */}
        <div className="mb-4">
          <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
            Load Quick Template
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl.title}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3 h-3 text-neutral-400" />
                <span>{tpl.title}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Audience / Recipient Group
            </label>
            <select
              value={recipientGroup}
              onChange={(e) => setRecipientGroup(e.target.value)}
              className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
            >
              <option value="HackFest Attendees (142)">HackFest &apos;26 Confirmed Attendees (142 students)</option>
              <option value="All Community Builders (340)">All Community Builders (340 registered members)</option>
              <option value="Core Organizers & Mentors (45)">Core Organizers &amp; Mentors (45 members)</option>
              <option value="Batch of 2027 (84)">Batch of 2027 Students (84 builders)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Email Subject Line *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Final Schedule & Hardware Lab Access Details"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Email Body Content *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Compose your campus broadcast..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-[#18181c] border border-white/15 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 resize-none font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            <span className="text-[11px] text-neutral-500 font-mono">
              Outgoing mail authenticated via PTSC SMTP relay.
            </span>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Broadcast Blast</span>
            </button>
          </div>
        </form>

        {sentNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Broadcast sent successfully to {recipientGroup}!</span>
          </div>
        )}
      </div>

      {/* 2. Broadcast History & Delivery Logs */}
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>Recent Broadcast Logs &amp; Analytics</span>
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            {campaigns.length} campaigns recorded
          </span>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {campaigns.map((camp) => (
            <div key={camp.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-white">{camp.subject}</p>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                  <span className="font-mono text-neutral-300">{camp.recipientGroup}</span>
                  <span>•</span>
                  <span>{camp.sentAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-[11px] text-neutral-400">Open Rate</p>
                  <p className="font-bold text-white font-mono">{camp.openRate}</p>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    camp.status === "Delivered"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {camp.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
