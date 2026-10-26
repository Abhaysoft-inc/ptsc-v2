"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Search,
  MapPin,
  Clock,
  Users,
  Trash2,
  Plus,
} from "lucide-react";
import { AdminEvent } from "@/lib/dashboard";

interface AdminEventsViewProps {
  events: AdminEvent[];
  onCreateEvent?: () => void;
  onOpenAttendance?: (eventTitle: string) => void;
  onDeleteEvent: (id: string) => void;
}

export default function AdminEventsView({
  events,
  onCreateEvent,
  onOpenAttendance,
  onDeleteEvent,
}: AdminEventsViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Upcoming" | "Completed">("All");

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.venue.toLowerCase().includes(search.toLowerCase()) ||
      evt.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" || evt.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleOpenAttendance = (eventTitle: string) => {
    if (onOpenAttendance) {
      onOpenAttendance(eventTitle);
    } else {
      router.push("/dashboard/attendance");
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search events by title, venue, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#121215] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Filter Pills & Create Link */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(["All", "Active", "Upcoming", "Completed"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                filter === tab
                  ? "bg-white text-black font-semibold"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {tab}
            </button>
          ))}

          <Link
            href="/dashboard/events/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-semibold shrink-0 cursor-pointer shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Event</span>
          </Link>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredEvents.map((evt) => {
          const percentRegistered = Math.min(
            100,
            Math.round((evt.registeredCount / evt.capacity) * 100)
          );

          return (
            <div
              key={evt.id}
              className="p-6 rounded-2xl bg-[#111113] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Status & Category */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      evt.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : evt.status === "Upcoming"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                    }`}
                  >
                    {evt.status}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {evt.category}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  {/* Segmented Date Box */}
                  <div className="shrink-0 flex flex-col items-center justify-center w-12 h-14 bg-[#18181b] border border-white/15 text-center select-none rounded-none">
                    <span className="text-[9px] font-bold text-neutral-400 tracking-wider uppercase">
                      {evt.date.month}
                    </span>
                    <span className="text-xl font-black text-white leading-none mt-1">
                      {evt.date.day}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      {evt.description}
                    </p>
                  </div>
                </div>

                {/* Venue & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/[0.06] text-xs text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span className="truncate">{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span>
                      Registered: <strong className="text-white">{evt.registeredCount}</strong> / {evt.capacity}
                    </span>
                    <span className="text-emerald-400">{percentRegistered}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percentRegistered >= 90 ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                      style={{ width: `${percentRegistered}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-5 mt-5 border-t border-white/[0.08] text-xs">
                <button
                  type="button"
                  onClick={() => handleOpenAttendance(evt.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Check-In Desk ({evt.attendedCount})</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onDeleteEvent(evt.id)}
                    title="Archive Event"
                    className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-16 bg-[#111113] rounded-2xl border border-white/10">
          <CalendarDays className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No events match your criteria</p>
          <p className="text-xs text-neutral-400 mt-1">Try resetting the filter or search query.</p>
        </div>
      )}
    </div>
  );
}
