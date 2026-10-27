"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import AdminAttendanceView, {
  ATTENDANCE_FILTERS,
  type AttendanceDraft,
  type AttendanceFilter,
} from "@/components/dashboard/AdminAttendanceView";
import EventSelect from "@/components/dashboard/EventSelect";
import { ErrorBanner, ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { selectedEventId, useAdminEvents } from "@/components/dashboard/useAdminEvents";
import { useDebouncedSearch } from "@/components/dashboard/useDebouncedSearch";
import { useUrlQuery } from "@/components/dashboard/useUrlQuery";
import { api, errorMessage } from "@/lib/api-client";
import type { AttendanceCounts, PageInfo, RegistrationRow } from "@/lib/types/admin";

interface AttendanceResponse extends PageInfo {
  rows: RegistrationRow[];
  counts: AttendanceCounts;
}

const UNSAVED_PROMPT = "You have unsaved attendance changes. Discard them?";

function AttendanceRoute() {
  const { events, error: eventsError } = useAdminEvents();
  const { params, page, setQuery } = useUrlQuery();

  const eventId = events ? selectedEventId(events, params.get("event")) : "";
  const q = params.get("q") ?? "";
  const filter: AttendanceFilter =
    ATTENDANCE_FILTERS.find((f) => f.toLowerCase() === params.get("status")) ?? "All";

  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // Unsaved marks for the current event. Kept across pages and searches.
  const [draft, setDraft] = useState<AttendanceDraft>({});
  const [saving, setSaving] = useState(false);

  const commitSearch = useCallback(
    (value: string) => setQuery({ q: value, page: null }),
    [setQuery]
  );
  const [searchInput, setSearchInput] = useDebouncedSearch(q, commitSearch);

  const unsaved = Object.values(draft).some((d) => d.attended !== d.saved);

  const load = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setLoadError(null);
    const query = new URLSearchParams({ page: String(page) });
    if (q) query.set("q", q);
    if (filter !== "All") query.set("attended", filter.toLowerCase());
    try {
      const result = await api<AttendanceResponse>(
        `/api/admin/events/${eventId}/registrations?${query}`
      );
      setData(result);
      if (result.page !== page) setQuery({ page: result.page });
    } catch (e) {
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [eventId, page, q, filter, setQuery]);

  useEffect(() => {
    // Refetch whenever the event, page, search or filter changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Warn before closing the tab or reloading with unsaved marks.
  useEffect(() => {
    if (!unsaved) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  if (eventsError) return <ErrorBlock title="Couldn't load events" message={eventsError} />;
  if (!events) return <LoadingBlock label="Loading events…" />;
  if (events.length === 0) {
    return <ErrorBlock title="No events yet" message="Create an event to take attendance." />;
  }

  const onMark = (rows: RegistrationRow[], attended: boolean) =>
    setDraft((prev) => {
      const next = { ...prev };
      for (const r of rows) {
        next[r.id] = { attended, saved: prev[r.id]?.saved ?? r.attended };
      }
      return next;
    });

  const onSave = async () => {
    const updates = Object.entries(draft)
      .filter(([, d]) => d.attended !== d.saved)
      .map(([id, d]) => ({ id, attended: d.attended }));
    if (updates.length === 0) return;
    setSaving(true);
    setActionError(null);
    try {
      const result = await api<{ saved: number; skipped: number }>(
        `/api/admin/events/${eventId}/attendance`,
        { method: "PATCH", body: JSON.stringify({ updates }) }
      );
      setDraft({});
      await load();
      if (result.skipped > 0) {
        setActionError(
          `${result.skipped} ${result.skipped === 1 ? "change was" : "changes were"} skipped because the registration was deleted.`
        );
      }
    } catch (e) {
      setActionError(errorMessage(e)); // keep the draft so nothing is lost
    } finally {
      setSaving(false);
    }
  };

  const onCheckIn = async (code: string) => {
    try {
      const result = await api<{ message: string; row: RegistrationRow }>(
        `/api/admin/events/${eventId}/attendance/check-in`,
        { method: "POST", body: JSON.stringify({ code }) }
      );
      // Saved on the server already; drop any unsaved mark for this row.
      setDraft((prev) => {
        if (!(result.row.id in prev)) return prev;
        const next = { ...prev };
        delete next[result.row.id];
        return next;
      });
      await load();
      return { ok: true, message: result.message };
    } catch (e) {
      return { ok: false, message: errorMessage(e) };
    }
  };

  return (
    <div className="space-y-5">
      <EventSelect
        events={events}
        value={eventId}
        onChange={(id) => {
          if (unsaved && !window.confirm(UNSAVED_PROMPT)) return;
          setDraft({});
          setQuery({ event: id, page: null, q: null, status: null });
        }}
      />

      {actionError && <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />}

      {loadError && !data ? (
        <ErrorBlock title="Couldn't load attendance" message={loadError} onRetry={load} />
      ) : !data ? (
        <LoadingBlock label="Loading attendees…" />
      ) : (
        <>
          {loadError && <ErrorBanner message={loadError} onDismiss={() => setLoadError(null)} />}
          <AdminAttendanceView
            key={eventId}
            rows={data.rows}
            pageInfo={data}
            loading={loading}
            counts={data.counts}
            draft={draft}
            onMark={onMark}
            onDiscard={() => setDraft({})}
            onSave={onSave}
            saving={saving}
            onCheckIn={onCheckIn}
            search={searchInput}
            onSearchChange={setSearchInput}
            filter={filter}
            onFilterChange={(f) =>
              setQuery({ status: f === "All" ? null : f.toLowerCase(), page: null })
            }
            onPageChange={(n) => setQuery({ page: n })}
          />
        </>
      )}
    </div>
  );
}

export default function AttendancePage() {
  // useSearchParams needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <AttendanceRoute />
    </Suspense>
  );
}
