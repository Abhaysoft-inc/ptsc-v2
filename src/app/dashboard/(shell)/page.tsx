"use client";

import { useRouter } from "next/navigation";
import AdminOverviewView from "@/components/dashboard/AdminOverviewView";
import { getTabHref } from "@/components/dashboard/DashboardSidebar";
import { ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { useAdminDashboard } from "@/context/AdminDashboardContext";
import { useApi } from "@/lib/use-api";
import type { OverviewData } from "@/lib/types/admin";

export default function OverviewPage() {
  const router = useRouter();
  const { currentUser } = useAdminDashboard();
  // Shows what it had last time straight away and refreshes in the background.
  const { data, error, loading, reload } = useApi<OverviewData>("/api/admin/overview");

  if (error && !data) {
    return <ErrorBlock title="Couldn't load the overview" message={error} onRetry={reload} />;
  }
  if (loading || !data) return <LoadingBlock label="Loading overview…" />;

  return (
    <AdminOverviewView
      data={data}
      name={currentUser.firstName}
      onNavigateTab={(tab) => router.push(getTabHref(tab))}
      onCreateEvent={() => router.push("/dashboard/events/create")}
    />
  );
}
