import Link from "next/link";
import { Users } from "lucide-react";
import EventCard from "./EventCard";
import type { EventData } from "@/lib/events";
import Reveal from "@/components/motion/Reveal";

/**
 * The landing page shows the first few events; /events has the full list. `events`
 * is just that first page, and `total` is how many exist.
 */
export default function Events({ events, total }: { events: EventData[]; total: number }) {
  const shown = events;

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
              Hands-on workshops, hackathons, and project showcases designed to
              help you learn new skills and build alongside fellow coders.
            </p>
          </div>

          {total > 0 && (
            <div className="text-xs text-neutral-400 flex items-center gap-2 shrink-0">
              <Users className="w-4 h-4 text-neutral-500" />
              <span>
                {total} {total === 1 ? "event" : "events"} so far
              </span>
            </div>
          )}
        </Reveal>

        {/* Events Cards Grid */}
        {shown.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {shown.map((event, i) => (
              <Reveal key={event.id} className="h-full" delay={(i % 3) * 0.1}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-sm text-neutral-400">
            No events are scheduled right now. Check back soon.
          </p>
        )}

        {total > events.length && (
          <div className="mt-10 text-center">
            <Link
              href="/events"
              className="inline-flex items-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors"
            >
              See all events
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
