"use client";

import AdminAttendanceView from "@/components/dashboard/AdminAttendanceView";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

export default function AdminAttendancePage() {
  const { attendance, events, handleToggleCheckIn, handleQuickVerify } =
    useAdminDashboard();

  return (
    <AdminAttendanceView
      attendance={attendance}
      events={events}
      onToggleCheckIn={handleToggleCheckIn}
      onQuickVerify={handleQuickVerify}
    />
  );
}
