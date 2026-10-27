"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import AdminRegistrationsView from "@/components/dashboard/AdminRegistrationsView";
import EventSelect from "@/components/dashboard/EventSelect";
import { ErrorBanner, ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { selectedEventId, useAdminEvents } from "@/components/dashboard/useAdminEvents";
import { useDebouncedSearch } from "@/components/dashboard/useDebouncedSearch";
import { useUrlQuery } from "@/components/dashboard/useUrlQuery";
import { useAdminDashboard } from "@/context/AdminDashboardContext";
import { api, errorMessage } from "@/lib/api-client";
import type { AttendanceCounts, PageInfo, RegistrationRow } from "@/lib/types/admin";

interface RegistrationsResponse extends PageInfo {
  rows: RegistrationRow[];
  counts: AttendanceCounts;
  trashCount: number;
}

function RegistrationsRoute() {
  // The previewed role, so "View as member" hides admin-only controls. The
  // server still checks the real role.
  const { role } = useAdminDashboard();
  const { events, error: eventsError } = useAdminEvents();
  const { params, page, setQuery } = useUrlQuery();

  const eventId = events ? selectedEventId(events, params.get("event")) : "";
  const q = params.get("q") ?? "";
  const trash = params.get("trash") === "1";

  const [data, setData] = useState<RegistrationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const commitSearch = useCallback(
    (value: string) => setQuery({ q: value, page: null }),
    [setQuery]
  );
  const [searchInput, setSearchInput] = useDebouncedSearch(q, commitSearch);

  const load = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setLoadError(null);
    const query = new URLSearchParams({ page: String(page) });
    if (q) query.set("q", q);
    if (trash) query.set("trash", "1");
    try {
      const result = await api<RegistrationsResponse>(
        `/api/admin/events/${eventId}/registrations?${query}`
      );
      setData(result);
      if (result.page !== page) setQuery({ page: result.page });
    } catch (e) {
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [eventId, page, q, trash, setQuery]);

  useEffect(() => {
    // Refetch whenever the event, page, search or trash view changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (eventsError) return <ErrorBlock title="Couldn't load events" message={eventsError} />;
  if (!events) return <LoadingBlock label="Loading events…" />;
  if (events.length === 0) {
    return <ErrorBlock title="No events yet" message="Create an event to collect registrations." />;
  }

  const onApply = async (ids: string[]) => {
    setActionError(null);
    const results = await Promise.allSettled(
      ids.map((id) =>
        trash
          ? api(`/api/admin/registrations/${id}`, {
              method: "PATCH",
              body: JSON.stringify({ action: "restore" }),
            })
          : api(`/api/admin/registrations/${id}`, { method: "DELETE" })
      )
    );
    const failed = results.filter((r) => r.status === "rejected");
    await load();
    if (failed.length) {
      setActionError(
        failed.length === ids.length
          ? errorMessage((failed[0] as PromiseRejectedResult).reason)
          : `${failed.length} of ${ids.length} couldn't be updated. Try again.`
      );
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-5">
      <EventSelect
        events={events}
        value={eventId}
        onChange={(id) => setQuery({ event: id, page: null, q: null, trash: null })}
      />

      {actionError && (
        <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />
      )}

      {loadError && !data ? (
        <ErrorBlock title="Couldn't load registrations" message={loadError} onRetry={load} />
      ) : !data ? (
        <LoadingBlock label="Loading registrations…" />
      ) : (
        <>
          {loadError && (
            <ErrorBanner message={loadError} onDismiss={() => setLoadError(null)} />
          )}
          <AdminRegistrationsView
            // Reset selection and expanded rows when switching event.
            key={eventId}
            rows={data.rows}
            pageInfo={data}
            loading={loading}
            trash={trash}
            onTrashChange={(t) => setQuery({ trash: t ? "1" : null, page: null })}
            trashCount={data.trashCount}
            activeCount={data.counts.total}
            search={searchInput}
            onSearchChange={setSearchInput}
            onPageChange={(n) => setQuery({ page: n })}
            canManage={role === "admin"}
            onApply={onApply}
            exportHref={`/api/admin/events/${eventId}/registrations/export`}
          />
        </>
      )}
    </div>
  );
}

export default function RegistrationsPage() {
  // useSearchParams needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <RegistrationsRoute />
    </Suspense>
  );
}
