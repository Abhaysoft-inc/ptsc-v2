import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublicEvent } from "@/lib/server/public-events";
import EventDetailClient from "./EventDetailClient";

export const instant = false;

async function EventDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getPublicEvent(id);

  if (!event) {
    notFound();
  }

  return <EventDetailClient event={event} />;
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080809] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <EventDetailContent params={params} />
    </Suspense>
  );
}
