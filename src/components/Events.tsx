"use client";

import { Users } from "lucide-react";
import EventCard from "./EventCard";
import { eventsList } from "@/lib/events";
import Reveal from "@/components/motion/Reveal";

export default function Events() {
  return (
    <section
      id="events"
      className="relative z-10 w-full bg-[#080808] border-t border-white/[0.08] py-20 px-6 sm:px-10 lg:px-14 select-none"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10 border-b border-white/[0.06]">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              Upcoming Events
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
              Hands-on workshops, demo days, and retreats designed to help you
              connect with builders and ship faster.
            </p>
          </div>

          <div className="text-xs text-neutral-400 flex items-center gap-2 shrink-0">
            <Users className="w-4 h-4 text-neutral-500" />
            <span>Over 350+ hackers joined past sessions</span>
          </div>
        </Reveal>

        {/* Events Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {eventsList.map((event, i) => (
            <Reveal key={event.id} className="h-full" delay={(i % 3) * 0.1}>
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
