"use client";

import { Suspense } from "react";
import AdminMailView from "@/components/dashboard/AdminMailView";
import { useEventParam } from "@/components/dashboard/useEventParam";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

function MailRoute() {
  const { events, registrations, mailLogs, handleSendMail, handleResendMail } =
    useAdminDashboard();
  const [eventId, setEventId] = useEventParam(events);

  return (
    <AdminMailView
      events={events}
      registrations={registrations}
      logs={mailLogs}
      onSend={handleSendMail}
      onResend={handleResendMail}
      eventId={eventId}
      onEventChange={setEventId}
    />
  );
}

export default function MailPage() {
  return (
    <Suspense fallback={null}>
      <MailRoute />
    </Suspense>
  );
}
