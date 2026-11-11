import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import SitePage, { PageHeader, Section, SectionTitle } from "@/components/site/SitePage";

export const metadata = {
  title: "Community | PTSC Club",
  description:
    "The Programming and Tech Skills Club is open to every branch and year. See who it's for and how to join.",
};

const WHO = [
  {
    tag: "all branches",
    text: "Whatever you study, if you're curious about code and technology there's a place for you here.",
  },
  {
    tag: "all years",
    text: "First years to final years learn side by side, and seniors help the people coming up behind them.",
  },
  {
    tag: "any level",
    text: "You don't need to know anything yet. Start from your first line of code or bring your own project.",
  },
];

const PERKS = [
  "Learning sessions and workshops with people at your level",
  "Real projects to build with teammates, not just tutorials",
  "Honest code reviews from seniors",
  "Hackathons and coding contests to test yourself",
  "Demo nights to show what you've built",
  "A friendly place to ask for help",
];

const STEPS = [
  {
    title: "Create an account",
    text: "Sign up with your college details. An admin checks and approves new members.",
  },
  {
    title: "Get approved",
    text: "Once you're approved you can sign in to the member dashboard.",
  },
  {
    title: "Show up",
    text: "Register for an event and come along. You don't need an account to register for events.",
  },
];

const primary =
  "inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-[0_2px_14px_rgba(255,255,255,0.12)] transition-all hover:scale-[1.02] hover:bg-neutral-200 active:scale-[0.98]";
const ghost =
  "inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/5";

export default function CommunityPage() {
  return (
    <SitePage>
      <PageHeader
        path="community"
        title="A club for people who like to build."
        lead="The Programming and Tech Skills Club is a student community for learning to code, building projects together and growing as developers."
      >
        <Link href="/signup" className={primary}>
          <span>Join the club</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/events" className={ghost}>
          See events
        </Link>
      </PageHeader>

      <Section>
        <SectionTitle label="who it's for" title="Everyone is welcome" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {WHO.map((item) => (
            <div key={item.tag} className="rounded-2xl border border-white/8 bg-white/2 p-6">
              <p className="font-mono text-xs text-emerald-400">{item.tag}</p>
              <p className="mt-3 text-sm leading-relaxed text-neutral-300">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-white/8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionTitle label="what you get" title="More than a club room">
              Members learn from each other, build things that work, and have people to turn to
              when they&apos;re stuck.
            </SectionTitle>
          </div>
          <ul className="space-y-3.5">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3 text-sm text-neutral-300 sm:text-[15px]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="border-t border-white/8">
        <SectionTitle label="how to join" title="Three steps" />
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-white/8 bg-white/2 p-6">
              <p className="font-mono text-xs text-neutral-500">0{i + 1}</p>
              <h3 className="mt-3 text-base font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/10 bg-[#0d0d10] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="font-mono text-xs text-neutral-500">$ ptsc join</p>
            <p className="mt-2 text-lg font-semibold text-white">Ready to start building?</p>
            <p className="mt-1 text-sm text-neutral-400">
              Meet the people behind the club, then come and say hi.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className={primary}>
              Create an account
            </Link>
            <Link href="/team" className={ghost}>
              Meet the team
            </Link>
          </div>
        </div>
      </Section>
    </SitePage>
  );
}
