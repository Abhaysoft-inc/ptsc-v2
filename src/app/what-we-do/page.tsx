import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SitePage, { PageHeader, Section, SectionTitle } from "@/components/site/SitePage";
import EventCard from "@/components/EventCard";
import { getPublicEventsSafe } from "@/lib/server/public-events";

export const metadata = {
  title: "What We Do | PTSC Club",
  description:
    "Learning together, building real projects, and competing in hackathons: what the Programming and Tech Skills Club does.",
};

const TRACKS = [
  {
    tag: "learn",
    title: "Learn together, code together",
    text: "Weekly sessions, pair programming and honest code reviews from seniors, so nobody learns alone.",
    points: ["Workshops and talks", "Peer sessions", "Code reviews"],
  },
  {
    tag: "build",
    title: "Build real-world projects",
    text: "Go beyond tutorials. Work on web, app and AI projects with starter templates, roadmaps and mentors who help you finish.",
    points: ["Web, app and AI projects", "Starter templates", "Mentor support"],
  },
  {
    tag: "compete",
    title: "Compete, showcase and get hired",
    text: "Test your skills in hackathons and coding contests, present at demo days and get ready for internships and placements.",
    points: ["Hackathons and contests", "Demo days", "Placement prep"],
  },
];

const FORMATS = ["Workshops", "Hackathons", "Demo days", "Sprints", "Talks", "Meetups"];

async function UpcomingEvents() {
  const events = (await getPublicEventsSafe()).filter((e) => e.status !== "past").slice(0, 3);

  if (events.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border border-dashed border-white/15 px-6 py-10 text-center text-sm text-neutral-400">
        No events are scheduled right now. Check back soon.
      </p>
    );
  }
  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default function WhatWeDoPage() {
  return (
    <SitePage>
      <PageHeader
        path="what-we-do"
        title="Learn it. Build it. Show it."
        lead="Everything the club does comes back to three things: learning with others, making real projects, and putting your skills to the test."
      />

      <Section>
        <SectionTitle label="three tracks" title="What the club is about" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TRACKS.map((track) => (
            <article
              key={track.tag}
              className="flex flex-col rounded-2xl border border-white/8 bg-white/2 p-6 transition-colors hover:border-white/20"
            >
              <p className="font-mono text-xs text-emerald-400">{track.tag}</p>
              <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-white">
                {track.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">{track.text}</p>
              <ul className="mt-5 space-y-1.5 border-t border-white/8 pt-4 font-mono text-xs text-neutral-500">
                {track.points.map((point) => (
                  <li key={point}>
                    <span className="text-neutral-700">&gt; </span>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section className="border-t border-white/8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionTitle label="how it shows up" title="Events, all year round">
            Most of what we do happens at events. You can join one, help run one, or come just to
            see what everyone is working on.
          </SectionTitle>

          <div
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10] font-mono text-xs text-neutral-300 shadow-[0_8px_40px_rgba(0,0,0,0.5)] sm:text-[13px]"
            aria-label="The kinds of events we run"
          >
            <div className="flex items-center gap-1.5 border-b border-white/6 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
              <span className="ml-3 text-[11px] text-neutral-500">~/ptsc/events</span>
            </div>
            <div className="space-y-1.5 px-4 py-4">
              <p>
                <span className="text-emerald-400">$ </span>ls formats/
              </p>
              <p className="grid grid-cols-2 gap-x-4 gap-y-1 text-neutral-400 sm:grid-cols-3">
                {FORMATS.map((f) => (
                  <span key={f}>{f.toLowerCase().replace(" ", "-")}/</span>
                ))}
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section className="border-t border-white/8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle label="coming up" title="Next on the calendar" />
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-300 transition-colors hover:text-white"
          >
            <span>All events</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <UpcomingEvents />
      </Section>
    </SitePage>
  );
}
