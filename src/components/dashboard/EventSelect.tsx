"use client";

import { CalendarDays } from "lucide-react";
import type { AdminEventSummary } from "@/lib/types/admin";
import Dropdown from "@/components/ui/dropdown";

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
    <div className="flex items-center gap-3 text-xs text-neutral-400 min-w-0">
      <CalendarDays className="w-4 h-4 shrink-0" />
      <Dropdown
        aria-label="Event"
        value={value}
        onChange={onChange}
        options={events.map((evt) => ({
          value: evt.id,
          label: `${evt.title}${evt.date ? ` · ${DATE.format(new Date(evt.date))}` : ""}`,
        }))}
        placeholder="Choose an event"
        className="min-w-0 sm:w-auto sm:min-w-72 max-w-full"
      />
    </div>
  );
}
