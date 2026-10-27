"use client";

import { CalendarDays } from "lucide-react";
import type { AdminEventSummary } from "@/lib/types/admin";

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default function EventSelect({
  events,
  value,
  onChange,
}: {
  events: AdminEventSummary[];
  value: string;
  onChange: (eventId: string) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-xs text-neutral-400 min-w-0">
      <CalendarDays className="w-4 h-4 shrink-0" />
      <span className="sr-only">Event</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3.5 py-2.5 bg-[#121215] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer min-w-0 w-full sm:w-auto sm:min-w-[18rem] max-w-full"
      >
        {events.map((evt) => (
          <option key={evt.id} value={evt.id}>
            {evt.title}
            {evt.date ? ` · ${DATE.format(new Date(evt.date))}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
