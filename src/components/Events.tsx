"use client";

import { Users } from "lucide-react";
import EventCard, { EventCardData } from "./EventCard";

const upcomingEvents: EventCardData[] = [
  {
    id: "event-peace",
    tag: "Lush and green",
    month: "JAN",
    day: "25",
    title: "Discovering Peace",
    description:
      "Far from the city's noise, the green mountains stretch endlessly into the horizon, blanketed with mist and silence.",
    image: "/bg.jpg",
    locationTitle: "Blue Ridge",
    locationSubtitle: "Virginia, USA",
  },
  {
    id: "event-ai-saas",
    tag: "Hands-on Workshop",
    month: "NOV",
    day: "04",
    title: "Full-Stack AI SaaS",
    description:
      "A deep-dive build session covering Next.js, API integrations, and shipping a monetization-ready micro-SaaS in one evening.",
    image: "/bg.jpg",
    locationTitle: "Lecture Hall 201",
    locationSubtitle: "Campus Innovation Hub",
  },
  {
    id: "event-demo-night",
    tag: "Community Showcase",
    month: "NOV",
    day: "18",
    title: "Indie Demo Night",
    description:
      "5-minute live demos from student founders and indie hackers. Honest feedback, live bug testing, and networking over coffee.",
    image: "/bg.jpg",
    locationTitle: "Main Seminar Hall",
    locationSubtitle: "Hacker Lounge, Block 4",
  },
];

export default function Events() {
  return (
    <section
      id="events"
      className="relative z-10 w-full bg-[#080808] border-t border-white/[0.08] py-20 px-6 sm:px-10 lg:px-14 select-none"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10 border-b border-white/[0.06]">
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
        </div>

        {/* Events Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id || event.title} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
