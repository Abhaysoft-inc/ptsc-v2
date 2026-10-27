"use client";

import { useRouter } from "next/navigation";
import AdminOverviewView from "@/components/dashboard/AdminOverviewView";
import { getTabHref } from "@/components/dashboard/DashboardSidebar";
import { useAdminDashboard } from "@/context/AdminDashboardContext";

export default function OverviewPage() {
  const router = useRouter();
  const { events, users, registrations } = useAdminDashboard();

  return (
    <AdminOverviewView
      events={events}
      users={users}
      registrations={registrations}
      onNavigateTab={(tab) => router.push(getTabHref(tab))}
      onCreateEvent={() => router.push("/dashboard/events/create")}
    />
  );
}
