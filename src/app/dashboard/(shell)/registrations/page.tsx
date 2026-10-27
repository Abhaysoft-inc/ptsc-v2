"use client";

import { Suspense } from "react";
import AdminRegistrationsView from "@/components/dashboard/AdminRegistrationsView";
import { useEventParam } from "@/components/dashboard/useEventParam";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

function RegistrationsRoute() {
  const {
    events,
    registrations,
    role,
    handleDeleteRegistration,
    handleRestoreRegistration,
  } = useAdminDashboard();
  const [eventId, setEventId] = useEventParam(events);

  return (
    <AdminRegistrationsView
      events={events}
      registrations={registrations}
      canManage={role === "admin"}
      onDelete={handleDeleteRegistration}
      onRestore={handleRestoreRegistration}
      eventId={eventId}
      onEventChange={setEventId}
    />
  );
}

export default function RegistrationsPage() {
  return (
    <Suspense fallback={null}>
      <RegistrationsRoute />
    </Suspense>
  );
}
