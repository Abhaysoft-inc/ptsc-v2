import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublicEvent } from "@/lib/server/public-events";
import EventRegisterClient from "./EventRegisterClient";

export const instant = false;

async function EventRegisterContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getPublicEvent(id);

  if (!event) {
    notFound();
  }

  return <EventRegisterClient event={event} />;
}

export default function EventRegisterPage({
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
      <EventRegisterContent params={params} />
    </Suspense>
  );
}
