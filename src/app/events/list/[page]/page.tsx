import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventsView, { PAGE_SIZE } from "../../EventsView";
import { getPublicEventCards } from "@/lib/server/public-events";
import { pageNumber } from "@/lib/paging";

// /events?page=N arrives here through a rewrite in next.config.ts. The pages that exist
// at build time are built ahead of time; later ones are built on their first visit.
export const instant = false;

type Props = { params: Promise<{ page: string }> };

export async function generateStaticParams() {
  try {
    const { totalPages } = await getPublicEventCards(1, PAGE_SIZE);
    return Array.from({ length: Math.min(totalPages, 20) }, (_, i) => ({ page: String(i + 1) }));
  } catch (error) {
    // No database during the build: these get built on their first visit instead.
    console.error("Events list: couldn't read the pages to prebuild:", error);
    return [{ page: "1" }];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = pageNumber((await params).page) ?? 1;
  return {
    title: "Events | PTSC Club",
    description: "Workshops, hackathons, demo days and meetups run by the Programming and Tech Skills Club.",
    alternates: { canonical: n > 1 ? `/events?page=${n}` : "/events" },
  };
}

export default async function EventsListPage({ params }: Props) {
  const n = pageNumber((await params).page);
  // A page past the end is missing, not a copy of the last page.
  if (!n || n > (await getPublicEventCards(1, PAGE_SIZE)).totalPages) notFound();
  return <EventsView page={n} />;
}
