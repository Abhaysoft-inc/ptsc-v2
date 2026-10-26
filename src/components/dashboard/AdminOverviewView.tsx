"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  QrCode,
  Mail,
  ArrowUpRight,
  Clock,
  Sparkles,
  ChevronRight,
  Plus,
} from "lucide-react";
import { AdminEvent, AdminUser, AttendanceRecord } from "@/lib/dashboard";
import { AdminDashboardTab } from "./DashboardSidebar";

interface AdminOverviewViewProps {
  events: AdminEvent[];
  users: AdminUser[];
  attendance: AttendanceRecord[];
  onNavigateTab?: (tab: AdminDashboardTab) => void;
  onCreateEvent?: () => void;
}

export default function AdminOverviewView({
  events,
  users,
  attendance,
  onNavigateTab,
}: AdminOverviewViewProps) {
  const router = useRouter();

  const handleNavigate = (tab: AdminDashboardTab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      router.push(tab === "overview" ? "/dashboard" : `/dashboard/${tab}`);
    }
  };

  const activeEventsCount = events.filter((e) => e.status === "Active" || e.status === "Upcoming").length;
  const checkedInCount = attendance.filter((a) => a.status === "Checked In" || a.status === "Late").length;

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#141418] via-[#111114] to-[#18181f] border border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CAMPUS ADMIN CONTROL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, Superadmin.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
              Managing PTSC operations, event check-in passes, student builders registry, and campus broadcast queues.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/events/create"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Event</span>
            </Link>

            <button
              type="button"
              onClick={() => handleNavigate("attendance")}
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
          onClick={() => handleNavigate("events")}
          className="p-5 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-3">
            <span>Manage Events</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white">{events.length}</p>
            <span className="text-[11px] text-emerald-400 font-mono">({activeEventsCount} Active)</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
            <span>Next: HackFest &apos;26</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" />
          </p>
        </div>

        <div
          onClick={() => handleNavigate("users")}
          className="p-5 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-3">
            <span>Manage Users</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white">{users.length}</p>
            <span className="text-[11px] text-blue-400 font-mono">Core &amp; Builders</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
            <span>Active Campus Members</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" />
          </p>
        </div>

        <div
          onClick={() => handleNavigate("attendance")}
          className="p-5 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-3">
            <span>Live Attendance</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white">{checkedInCount}</p>
            <span className="text-[11px] text-purple-400 font-mono">/ {attendance.length} Scanned</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
            <span>83% Check-in Rate</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" />
          </p>
        </div>

        <div
          onClick={() => handleNavigate("mails")}
          className="p-5 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-3">
            <span>Mail Management</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white">4</p>
            <span className="text-[11px] text-amber-400 font-mono">Campaigns</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2 flex items-center justify-between">
            <span>94.2% Avg Open Rate</span>
            <ArrowUpRight className="w-3 h-3 text-neutral-500 group-hover:text-white transition-colors" />
          </p>
        </div>
      </div>

      {/* 3. Split: Active Event Focus & Live Check-in Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Event Spotlight (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111113] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white tracking-tight">Active Campus Event</h3>
            </div>
            <button
              type="button"
              onClick={() => handleNavigate("events")}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>All Events</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                {events[0]?.status}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {events[0]?.date.month} {events[0]?.date.day}, {events[0]?.date.year}
              </span>
            </div>

            <h4 className="text-lg font-bold text-white mt-2">
              {events[0]?.title}
            </h4>
            <p className="text-xs text-neutral-400 mt-1">
              {events[0]?.venue} • {events[0]?.time}
            </p>

            <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <p className="text-[11px] text-neutral-400">Total Registered</p>
                <p className="text-base font-bold text-white font-mono">
                  {events[0]?.registeredCount} / {events[0]?.capacity} Seats
                </p>
              </div>

              <div className="w-32 bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{
                    width: `${Math.round(((events[0]?.registeredCount || 0) / (events[0]?.capacity || 1)) * 100)}%`,
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => handleNavigate("attendance")}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
              >
                Launch Check-in
              </button>
            </div>
          </div>
        </div>

        {/* Recent Attendance Stream (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111113] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>Recent Check-Ins</span>
            </h3>
            <button
              type="button"
              onClick={() => handleNavigate("attendance")}
              className="text-xs text-emerald-400 hover:underline cursor-pointer"
            >
              Live Desk
            </button>
          </div>

          <div className="space-y-2.5">
            {attendance.slice(0, 4).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-white">{record.userName}</p>
                    <p className="text-[10px] text-neutral-500 font-mono">{record.ticketId} • {record.seat}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-[11px] text-neutral-400">{record.checkInTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
