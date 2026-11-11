"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminEventsView from "@/components/dashboard/AdminEventsView";
import { ErrorBanner, ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { useAdminDashboard } from "@/context/AdminDashboardContext";
import { api, errorMessage } from "@/lib/api-client";
import type { AdminEvent } from "@/lib/types/admin";

export default function EventsPage() {
  const router = useRouter();
  const { role } = useAdminDashboard();
  const [events, setEvents] = useState<AdminEvent[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api<{ events: AdminEvent[] }>("/api/admin/events?view=full")
      .then((data) => !cancelled && setEvents(data.events))
      .catch((e) => !cancelled && setLoadError(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setLoadError(null);
    setReloadKey((k) => k + 1);
  };

  const handleDelete = async (id: string) => {
    const event = events?.find((e) => e.id === id);
    if (!window.confirm(`Delete "${event?.title ?? "this event"}"? This can't be undone.`)) return;
    setActionError(null);
    try {
      await api(`/api/admin/events/${id}`, { method: "DELETE" });
      setEvents((prev) => prev?.filter((e) => e.id !== id) ?? prev);
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  if (loadError) {
    return <ErrorBlock title="Couldn't load events" message={loadError} onRetry={retry} />;
  }
  if (!events) return <LoadingBlock label="Loading events…" />;

  return (
    <div className="space-y-4">
      {actionError && <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />}
      <AdminEventsView
        events={events}
        canManage={role !== "normal"}
        canDelete={role === "admin"}
        onCreateEvent={() => router.push("/dashboard/events/create")}
        onEditEvent={(id) => router.push(`/dashboard/events/${id}/edit`)}
        onOpenAttendance={(eventId) =>
          router.push(`/dashboard/attendance?event=${eventId}`)
        }
        onDeleteEvent={handleDelete}
      />
    </div>
  );
}
