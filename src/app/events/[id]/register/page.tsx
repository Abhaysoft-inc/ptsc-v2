import { notFound } from "next/navigation";
import { getPublicEvent } from "@/lib/server/public-events";
import EventRegisterClient from "./EventRegisterClient";

export const instant = false;

export default async function EventRegisterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getPublicEvent(id);
  if (!event) notFound();

  return <EventRegisterClient event={event} />;
}
