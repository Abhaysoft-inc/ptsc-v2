import { Suspense } from "react";
import EventEditor from "@/components/dashboard/event-form/EventEditor";

async function EditEventContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventEditor eventId={id} />;
}

// The id comes from the URL at request time, so it's read behind Suspense.
export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <EditEventContent params={params} />
    </Suspense>
  );
}
