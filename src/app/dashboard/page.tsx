"use client";

import AdminOverviewView from "@/components/dashboard/AdminOverviewView";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

export default function DashboardOverviewPage() {
  const { events, users, attendance } = useAdminDashboard();

  return (
    <AdminOverviewView
      events={events}
      users={users}
      attendance={attendance}
    />
  );
}
