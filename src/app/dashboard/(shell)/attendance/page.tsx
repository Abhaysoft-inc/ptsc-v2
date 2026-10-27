"use client";

import { Suspense } from "react";
import AdminAttendanceView from "@/components/dashboard/AdminAttendanceView";
import { useEventParam } from "@/components/dashboard/useEventParam";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

function AttendanceRoute() {
  const { events, registrations, handleSaveAttendance } = useAdminDashboard();
  const [eventId, setEventId] = useEventParam(events);

  return (
    <AdminAttendanceView
      events={events}
      registrations={registrations}
      onSave={handleSaveAttendance}
      eventId={eventId}
      onEventChange={setEventId}
    />
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={null}>
      <AttendanceRoute />
    </Suspense>
  );
}
