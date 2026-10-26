"use client";

import { useState } from "react";
import { X, CalendarDays } from "lucide-react";
import { AdminEvent } from "@/lib/dashboard";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Omit<AdminEvent, "id" | "registeredCount" | "attendedCount">) => void;
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Hackathon");
  const [month, setMonth] = useState("MAR");
  const [day, setDay] = useState("14");
  const [year] = useState("2026");
  const [time, setTime] = useState("10:00 AM – 4:00 PM EST");
  const [venue, setVenue] = useState("Campus Auditorium Hall A");
  const [capacity, setCapacity] = useState(150);
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      category,
      date: { month, day, year },
      time,
      venue,
      capacity: Number(capacity) || 100,
      status: "Upcoming",
      description: description.trim() || "Campus tech and builder event.",
    });

    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#111113] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
          aria-label="Close Event Modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <CalendarDays className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold text-white tracking-tight">
            Create Campus Event
          </h3>
        </div>
        <p className="text-xs text-neutral-400 mb-6">
          Schedule an upcoming hackathon, workshop, or demo day for PTSC members.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NextGen Web3 & AI Hackathon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 cursor-pointer"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Workshop">Workshop</option>
                <option value="Demo Day">Demo Day</option>
                <option value="Sprint">Sprint</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Seat Capacity
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Date (Month / Day)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="MAR"
                  value={month}
                  onChange={(e) => setMonth(e.target.value.toUpperCase())}
                  className="w-1/2 bg-[#18181c] border border-white/15 rounded-xl px-3 py-2 text-xs text-white text-center font-mono focus:outline-none focus:border-white/40 uppercase"
                />
                <input
                  type="text"
                  placeholder="14"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-1/2 bg-[#18181c] border border-white/15 rounded-xl px-3 py-2 text-xs text-white text-center font-mono focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Time Window
              </label>
              <input
                type="text"
                placeholder="10:00 AM – 4:00 PM EST"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Venue Location
            </label>
            <input
              type="text"
              placeholder="Campus Auditorium Hall A"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full bg-[#18181c] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Event Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief details about the event track and student eligibility..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#18181c] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-colors cursor-pointer"
            >
              Publish Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
