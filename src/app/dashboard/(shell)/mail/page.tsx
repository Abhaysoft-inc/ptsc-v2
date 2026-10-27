"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import AdminMailView, {
  MAIL_STATUS_FILTERS,
  MAIL_TYPE_FILTERS,
  TYPE_VALUE,
  type MailStatusFilter,
  type MailTypeFilter,
} from "@/components/dashboard/AdminMailView";
import EventSelect from "@/components/dashboard/EventSelect";
import { ErrorBanner, ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { selectedEventId, useAdminEvents } from "@/components/dashboard/useAdminEvents";
import { useDebouncedSearch } from "@/components/dashboard/useDebouncedSearch";
import { useUrlQuery } from "@/components/dashboard/useUrlQuery";
import { api, errorMessage } from "@/lib/api-client";
import type { MailLogRow, MailSummary, PageInfo } from "@/lib/types/admin";

interface MailLogsResponse extends PageInfo {
  logs: MailLogRow[];
  summary: MailSummary;
}

function MailRoute() {
  const { events, error: eventsError } = useAdminEvents();
  const { params, page, setQuery } = useUrlQuery();

  const eventId = events ? selectedEventId(events, params.get("event")) : "";
  const q = params.get("q") ?? "";
  const typeFilter: MailTypeFilter =
    MAIL_TYPE_FILTERS.find((f) => f !== "All" && TYPE_VALUE[f] === params.get("type")) ?? "All";
  const statusFilter: MailStatusFilter =
    MAIL_STATUS_FILTERS.find((f) => f.toLowerCase() === params.get("status")) ?? "All";

  const [data, setData] = useState<MailLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
    if (typeFilter !== "All") query.set("type", TYPE_VALUE[typeFilter]);
    if (statusFilter !== "All") query.set("status", statusFilter.toLowerCase());
    try {
      const result = await api<MailLogsResponse>(`/api/admin/events/${eventId}/mail-logs?${query}`);
      setData(result);
      if (result.page !== page) setQuery({ page: result.page });
    } catch (e) {
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [eventId, page, q, typeFilter, statusFilter, setQuery]);

  useEffect(() => {
    // Refetch whenever the event, page, search or filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (eventsError) return <ErrorBlock title="Couldn't load events" message={eventsError} />;
  if (!events) return <LoadingBlock label="Loading events…" />;
  if (events.length === 0) {
    return <ErrorBlock title="No events yet" message="Emails are logged per event." />;
  }

  return (
    <div className="space-y-5">
      <EventSelect
        events={events}
        value={eventId}
        onChange={(id) => setQuery({ event: id, page: null, q: null, type: null, status: null })}
      />

      {loadError && !data ? (
        <ErrorBlock title="Couldn't load email logs" message={loadError} onRetry={load} />
      ) : !data ? (
        <LoadingBlock label="Loading email logs…" />
      ) : (
        <>
          {loadError && <ErrorBanner message={loadError} onDismiss={() => setLoadError(null)} />}
          <AdminMailView
            logs={data.logs}
            summary={data.summary}
            pageInfo={data}
            loading={loading}
            search={searchInput}
            onSearchChange={setSearchInput}
            typeFilter={typeFilter}
            onTypeFilterChange={(f) => setQuery({ type: f === "All" ? null : TYPE_VALUE[f], page: null })}
            statusFilter={statusFilter}
            onStatusFilterChange={(f) => setQuery({ status: f === "All" ? null : f.toLowerCase(), page: null })}
            onPageChange={(n) => setQuery({ page: n })}
          />
        </>
      )}
    </div>
  );
}

export default function MailPage() {
  // useSearchParams needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <MailRoute />
    </Suspense>
  );
}
