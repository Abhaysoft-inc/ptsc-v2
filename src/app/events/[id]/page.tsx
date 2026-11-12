import { notFound } from "next/navigation";
import { getPublicEvent } from "@/lib/server/public-events";
import EventDetailClient from "./EventDetailClient";

export const instant = false;

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Looked up before anything streams, so an unknown event is a real 404 (not a 200 page
  // that says "not found").
  const event = await getPublicEvent(id);
  if (!event) notFound();

  return <EventDetailClient event={event} />;
}
