"use client";

import { useState } from "react";
import {
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ScanLine,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { AttendanceRecord, AdminEvent } from "@/lib/dashboard";

interface AdminAttendanceViewProps {
  attendance: AttendanceRecord[];
  events: AdminEvent[];
  onToggleCheckIn: (id: string) => void;
  onQuickVerify: (ticketId: string) => boolean;
}

export default function AdminAttendanceView({
  attendance,
  events,
  onToggleCheckIn,
  onQuickVerify,
}: AdminAttendanceViewProps) {
  const [search, setSearch] = useState("");
  const [ticketInput, setTicketInput] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.title || "PTSC HackFest '26");
  const [scanFeedback, setScanFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const checkedInCount = attendance.filter(
    (a) => a.status === "Checked In" || a.status === "Late"
  ).length;
  const pendingCount = attendance.filter((a) => a.status === "Pending").length;
  const turnoutRate = Math.round((checkedInCount / (attendance.length || 1)) * 100);

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    const success = onQuickVerify(ticketInput.trim());
    if (success) {
      setScanFeedback({
        type: "success",
        message: `✓ Ticket ${ticketInput.trim().toUpperCase()} verified & attendee checked in!`,
      });
      setTicketInput("");
    } else {
      setScanFeedback({
        type: "error",
        message: `✕ Ticket ${ticketInput.trim().toUpperCase()} not found or already verified.`,
      });
    }

    setTimeout(() => setScanFeedback(null), 4000);
  };

  const filteredAttendance = attendance.filter((a) => {
    const matchesSearch =
      a.userName.toLowerCase().includes(search.toLowerCase()) ||
      a.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      a.seat.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Quick Scanner & Ticket Input Strip */}
      <div className="p-6 rounded-2xl bg-[#121215] border border-white/15 shadow-xl">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ScanLine className="w-4 h-4" />
              <span>LIVE DESK SCANNER</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Rapid QR Ticket Verification
            </h3>
            <p className="text-xs text-neutral-400">
              Active Session: <strong className="text-white">{selectedEvent}</strong>
            </p>
          </div>

          {/* Quick Ticket Input Form */}
          <form onSubmit={handleManualScan} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Scan or enter Ticket ID (e.g. PTSC-5110)..."
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#18181c] border border-white/15 rounded-xl text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-white/40"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
            >
              Verify Pass
            </button>
          </form>
        </div>

        {/* Scan Feedback Banner */}
        {scanFeedback && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200 ${
              scanFeedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {scanFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{scanFeedback.message}</span>
          </div>
        )}
      </div>

      {/* 2. Check-In Analytics KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111113] border border-white/10">
          <p className="text-neutral-400 text-xs">Total Registered</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">{attendance.length}</p>
          <p className="text-[10px] text-neutral-500 mt-1">Confirmed passes</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111113] border border-white/10">
          <p className="text-neutral-400 text-xs">Present &amp; Verified</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{checkedInCount}</p>
          <p className="text-[10px] text-neutral-500 mt-1">Checked in hall</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111113] border border-white/10">
          <p className="text-neutral-400 text-xs">Pending Arrival</p>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{pendingCount}</p>
          <p className="text-[10px] text-neutral-500 mt-1">Awaiting check-in</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111113] border border-white/10">
          <p className="text-neutral-400 text-xs">Turnout Rate</p>
          <p className="text-2xl font-bold font-mono text-white mt-1">{turnoutRate}%</p>
          <p className="text-[10px] text-neutral-500 mt-1">Of registered capacity</p>
        </div>
      </div>

      {/* 3. Attendee Registry Table */}
      <div className="bg-[#111113] border border-white/10 rounded-2xl overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by ticket ID, name, or seat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#18181c] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>Showing {filteredAttendance.length} attendees</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.08] text-neutral-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Ticket ID</th>
                <th className="py-3 px-3">Attendee</th>
                <th className="py-3 px-3">Batch</th>
                <th className="py-3 px-3">Seat</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Check-In Time</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    {record.ticketId}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-white">{record.userName}</p>
                    <p className="text-[11px] text-neutral-400">{record.userEmail}</p>
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-400">{record.batch}</td>
                  <td className="py-3 px-3 font-mono text-neutral-300">{record.seat}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        record.status === "Checked In"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : record.status === "Late"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-400">{record.checkInTime}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onToggleCheckIn(record.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        record.status === "Checked In" || record.status === "Late"
                          ? "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10"
                          : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {record.status === "Checked In" || record.status === "Late"
                        ? "Undo"
                        : "Check In"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
