"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminEventsView, {
  EVENT_FILTERS,
  type EventFilter,
} from "@/components/dashboard/AdminEventsView";
import { ErrorBanner, ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { useUrlQuery } from "@/components/dashboard/useUrlQuery";
import { useDebouncedSearch } from "@/components/dashboard/useDebouncedSearch";
import { useAdminDashboard } from "@/context/AdminDashboardContext";
import { api, errorMessage } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import type { AdminEvent, PageInfo } from "@/lib/types/admin";

interface EventsResponse extends PageInfo {
  events: AdminEvent[];
}

function EventsRoute() {
  const router = useRouter();
  const { role } = useAdminDashboard();
  const { params, page, setQuery } = useUrlQuery();

  // Page, search and filter live in the URL (?page=2&q=hack&status=upcoming), so a
  // refresh or the back button keeps your place. The server does the filtering.
  const q = params.get("q") ?? "";
  const statusParam = params.get("status");
  const filter: EventFilter = EVENT_FILTERS.find((f) => f.toLowerCase() === statusParam) ?? "All";
  const [search, setSearch] = useDebouncedSearch(q, (value) => setQuery({ q: value, page: null }));

  const query = new URLSearchParams({ view: "full", page: String(page) });
  if (q) query.set("q", q);
  if (filter !== "All") query.set("status", filter.toLowerCase());
  const { data, error, loading, refreshing, reload } = useApi<EventsResponse>(
    `/api/admin/events?${query}`
  );

  const [actionError, setActionError] = useState<string | null>(null);

  // The server clamps a page past the end; keep the URL in step.
  useEffect(() => {
    if (data && data.page !== page) setQuery({ page: data.page });
  }, [data, page, setQuery]);

  const handleDelete = async (id: string) => {
    const event = data?.events.find((e) => e.id === id);
    if (!window.confirm(`Delete "${event?.title ?? "this event"}"? This can't be undone.`)) return;
    setActionError(null);
    try {
      await api(`/api/admin/events/${id}`, { method: "DELETE" });
      await reload(); // counts and paging change, so ask again
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  if (error && !data) {
    return <ErrorBlock title="Couldn't load events" message={error} onRetry={reload} />;
  }
  if (loading || !data) return <LoadingBlock label="Loading events…" />;

  return (
    <div className="space-y-4">
      {actionError && <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />}
      <AdminEventsView
        events={data.events}
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={(next) =>
          setQuery({ status: next === "All" ? null : next.toLowerCase(), page: null })
        }
        pageInfo={data}
        onPageChange={(next) => setQuery({ page: next })}
        loading={refreshing}
        canManage={role !== "normal"}
        canDelete={role === "admin"}
        onCreateEvent={() => router.push("/dashboard/events/create")}
        onEditEvent={(id) => router.push(`/dashboard/events/${id}/edit`)}
        onOpenAttendance={(eventId) => router.push(`/dashboard/attendance?event=${eventId}`)}
        onDeleteEvent={handleDelete}
      />
    </div>
  );
}

// useSearchParams needs a Suspense boundary above it.
export default function EventsPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading events…" />}>
      <EventsRoute />
    </Suspense>
  );
}
