"use client";

import { useRouter } from "next/navigation";
import AdminEventsView from "@/components/dashboard/AdminEventsView";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

export default function EventsPage() {
  const router = useRouter();
  const { events, role, handleDeleteEvent } = useAdminDashboard();

  return (
    <AdminEventsView
      events={events}
      canManage={role !== "normal"}
      onCreateEvent={() => router.push("/dashboard/events/create")}
      onOpenAttendance={(eventId) =>
        router.push(`/dashboard/attendance?event=${eventId}`)
      }
      onDeleteEvent={handleDeleteEvent}
    />
  );
}
