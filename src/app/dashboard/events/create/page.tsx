"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  Layers,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

export default function CreateEventPage() {
  const router = useRouter();
  const { handleCreateEvent } = useAdminDashboard();

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Hackathon");
  const [description, setDescription] = useState("");
  const [month, setMonth] = useState("MAR");
  const [day, setDay] = useState("14");
  const [year] = useState("2026");
  const [time, setTime] = useState("10:00 AM – 5:00 PM EST");
  const [venue, setVenue] = useState("Campus Auditorium Hall A");
  const [capacity, setCapacity] = useState(150);
  const [status, setStatus] = useState<"Upcoming" | "Active" | "Draft">("Upcoming");
  const [tags, setTags] = useState("AI Agents, Full Stack, Rust");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    handleCreateEvent({
      title: title.trim(),
      category,
      date: { month: month.trim().toUpperCase(), day: day.trim(), year },
      time: time.trim(),
      venue: venue.trim(),
      capacity: Number(capacity) || 100,
      status: status === "Draft" ? "Upcoming" : status,
      description: description.trim() || "Annual campus tech innovation event.",
    });

    setSubmitted(true);
    setTimeout(() => {
      router.push("/dashboard/events");
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Breadcrumb & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Manage Events</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Event Creator</span>
        </div>
      </div>

      {/* Title Header */}
      <div className="pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
          <Sparkles className="w-4 h-4" />
          <span>PTSC NETWORK EVENT PUBLISHER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create New Campus Event
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Configure schedule logistics, seat allocations, attendee check-in desks, and track categories.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Core Details */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
              1. Event Overview
            </h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NextGen AI & Micro-SaaS HackFest '26"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#18181c] border border-white/15 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Workshop">Technical Workshop</option>
                <option value="Demo Day">Founder Demo Day</option>
                <option value="Sprint">Open Source Sprint</option>
                <option value="Speaker Session">Speaker Session</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Initial Publishing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer font-mono"
              >
                <option value="Upcoming">Upcoming (Registrations Open)</option>
                <option value="Active">Active (Happening Today)</option>
                <option value="Draft">Draft (Private)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Event Description &amp; Objectives
            </label>
            <textarea
              rows={3}
              placeholder="Provide a comprehensive summary of student eligibility, problem statements, hackathon rules, and mentorship schedules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#18181c] border border-white/15 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 resize-none font-sans"
            />
          </div>
        </div>

        {/* Section 2: Date, Time & Venue */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <CalendarDays className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
              2. Logistics, Date &amp; Location
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Date (Month &amp; Day)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="MAR"
                  value={month}
                  onChange={(e) => setMonth(e.target.value.toUpperCase())}
                  className="w-1/2 bg-[#18181c] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white text-center font-mono focus:outline-none focus:border-white/40 uppercase"
                />
                <input
                  type="text"
                  required
                  placeholder="14"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-1/2 bg-[#18181c] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white text-center font-mono focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Time Window
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  placeholder="10:00 AM – 5:00 PM EST"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#18181c] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Campus Venue &amp; Auditorium Hall
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                required
                placeholder="Campus Auditorium Hall A (or CS Lab 304)"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#18181c] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Capacity & Tags */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111113] border border-white/10 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Users className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
              3. Seating Capacity &amp; Focus Tags
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Maximum Attendee Capacity
              </label>
              <input
                type="number"
                min="10"
                max="2000"
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 font-mono"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                Seats will be automatically numbered for rapid QR check-in desks.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Tech Tracks / Tags (comma separated)
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="AI Agents, Next.js, Rust, Docker"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#18181c] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons & Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
          <Link
            href="/dashboard/events"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white text-xs font-medium transition-colors text-center cursor-pointer"
          >
            Cancel &amp; Discard
          </Link>

          <button
            type="submit"
            disabled={submitted}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
            <span>{submitted ? "Publishing Event..." : "Publish Campus Event"}</span>
          </button>
        </div>

        {submitted && (
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Event published successfully! Redirecting to events list...</span>
          </div>
        )}
      </form>
    </div>
  );
}
