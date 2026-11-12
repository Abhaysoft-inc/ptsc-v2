"use client";

import {
  CalendarDays,
  Users,
  QrCode,
  Mail,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Plus,
} from "lucide-react";
import type { OverviewData } from "@/lib/types/admin";
import { DashboardTab } from "./DashboardSidebar";
import StaggerList from "@/components/motion/StaggerList";

interface AdminOverviewViewProps {
  data: OverviewData;
  /** First name of the signed-in user. */
  name: string;
  onNavigateTab: (tab: DashboardTab) => void;
  onCreateEvent: () => void;
}

const TIME = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });

export default function AdminOverviewView({
  data,
  name,
  onNavigateTab,
  onCreateEvent,
}: AdminOverviewViewProps) {
  const { events, members, attendance, recentCheckIns, mail, blogs } = data;
  const focus = events.focus;
  const checkInRate = Math.round(
    (attendance.checkedIn / (attendance.registered || 1)) * 100
  );
  const focusPercent =
    focus && focus.capacity > 0
      ? Math.min(100, Math.round((focus.registeredCount / focus.capacity) * 100))
      : 0;

  return (
    <StaggerList className="space-y-8">
      {blogs.awaitingReview > 0 && (
        <button
          type="button"
          onClick={() => onNavigateTab("blog")}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-3.5 text-left text-xs text-amber-300 transition-colors hover:bg-amber-500/10 cursor-pointer"
        >
          <span>
            <strong className="font-semibold">
              {blogs.awaitingReview} blog {blogs.awaitingReview === 1 ? "post is" : "posts are"} waiting for review
            </strong>
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
        </button>
      )}

      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#141418] via-[#111114] to-[#18181f] border border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {name}.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
              Manage PTSC events, registrations, attendance and member requests from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCreateEvent}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Event</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab("attendance")}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all cursor-pointer"
            >
              Open Check-in Desk
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab("events")}
          className="p-5 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-3">
            <span>Manage Events</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white">{events.total}</p>
            <span className="text-[11px] text-emerald-400 font-mono">({events.open} open)</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
            <span className="truncate">
              {focus ? `Next: ${focus.title}` : "No events yet"}
            </span>
            <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors shrink-0" />
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("users")}
          className="p-5 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-3">
            <span>Members</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white">{members.approved}</p>
            <span className="text-[11px] text-blue-400 font-mono">approved</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
            <span>
              {members.pending > 0
                ? `${members.pending} awaiting approval`
                : "No pending requests"}
            </span>
            <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" />
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("attendance")}
          className="p-5 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-3">
            <span>Attendance</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white">{attendance.checkedIn}</p>
            <span className="text-[11px] text-purple-400 font-mono">/ {attendance.registered} registered</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
            <span>{checkInRate}% check-in rate, all events</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" />
          </p>
        </div>

        <div
          onClick={() => onNavigateTab("mails")}
          className="p-5 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-3">
            <span>Mail Management</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white">{mail.sent}</p>
            <span className="text-[11px] text-amber-400 font-mono">mails sent</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
            <span className={mail.failed > 0 ? "text-red-400" : undefined}>
              {mail.failed} failed
              {mail.pending > 0 ? ` · ${mail.pending} pending` : ""}
            </span>
            <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" />
          </p>
        </div>
      </div>

      {/* 3. Split: Event Focus & Recent Check-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111113] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  focus?.status === "Active" ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                }`}
              />
              <h3 className="text-sm font-bold text-white tracking-tight">
                {focus?.status === "Active" ? "Happening Today" : "Next Event"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("events")}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>All Events</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {focus ? (
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  {focus.status}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {focus.date.month} {focus.date.day}, {focus.date.year}
                </span>
              </div>

              <h4 className="text-lg font-bold text-white mt-2">{focus.title}</h4>
              <p className="text-xs text-neutral-400 mt-1">
                {focus.venue || "Venue to be announced"} • {focus.time || "Time to be announced"}
              </p>

              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] text-neutral-400">Total Registered</p>
                  <p className="text-base font-bold text-white font-mono">
                    {focus.registeredCount}
                    {focus.capacity > 0 ? ` / ${focus.capacity} Seats` : " · no limit"}
                  </p>
                </div>

                {focus.capacity > 0 && (
                  <div className="w-32 bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${focusPercent}%` }}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onNavigateTab("attendance")}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  Launch Check-in
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-8 text-center">
              No events yet. Create one to get started.
            </p>
          )}
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111113] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>Recent Check-Ins</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab("attendance")}
              className="text-xs text-emerald-400 hover:underline cursor-pointer"
            >
              Live Desk
            </button>
          </div>

          <div className="space-y-2.5">
            {recentCheckIns.length === 0 && (
              <p className="text-xs text-neutral-500 py-4 text-center">
                No one has been checked in yet.
              </p>
            )}
            {recentCheckIns.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{record.name}</p>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {record.registrationId}
                    </p>
                  </div>
                </div>

                <div className="text-right min-w-0">
                  <p className="font-mono text-[11px] text-neutral-400 truncate max-w-[10rem]">
                    {record.eventTitle}
                  </p>
                  {record.attendedAt && (
                    <p className="text-[10px] text-neutral-500">
                      {TIME.format(new Date(record.attendedAt))}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaggerList>
  );
}
