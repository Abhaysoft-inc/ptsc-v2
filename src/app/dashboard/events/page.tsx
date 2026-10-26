"use client";

import AdminEventsView from "@/components/dashboard/AdminEventsView";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

export default function AdminEventsPage() {
  const { events, handleDeleteEvent } = useAdminDashboard();

  return (
    <AdminEventsView
      events={events}
      onDeleteEvent={handleDeleteEvent}
    />
  );
}
