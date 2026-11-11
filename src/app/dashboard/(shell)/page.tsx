"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminOverviewView from "@/components/dashboard/AdminOverviewView";
import { getTabHref } from "@/components/dashboard/DashboardSidebar";
import { ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { useAdminDashboard } from "@/context/AdminDashboardContext";
import { api, errorMessage } from "@/lib/api-client";
import type { OverviewData } from "@/lib/types/admin";

export default function OverviewPage() {
  const router = useRouter();
  const { currentUser } = useAdminDashboard();
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api<OverviewData>("/api/admin/overview")
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setError(null);
    setReloadKey((k) => k + 1);
  };

  if (error) return <ErrorBlock title="Couldn't load the overview" message={error} onRetry={retry} />;
  if (!data) return <LoadingBlock label="Loading overview…" />;

  return (
    <AdminOverviewView
      data={data}
      name={currentUser.firstName}
      onNavigateTab={(tab) => router.push(getTabHref(tab))}
      onCreateEvent={() => router.push("/dashboard/events/create")}
    />
  );
}
