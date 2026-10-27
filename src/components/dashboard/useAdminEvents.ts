"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api-client";
import type { AdminEventSummary } from "@/lib/types/admin";

/** The real events for the dashboard's event pickers, newest first. */
export function useAdminEvents() {
  const [events, setEvents] = useState<AdminEventSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<{ events: AdminEventSummary[] }>("/api/admin/events")
      .then((data) => !cancelled && setEvents(data.events))
      .catch((e) => !cancelled && setError(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  return { events, error };
}

/**
 * The selected event: `?event=<id>` when it names a real event, otherwise the
 * newest one.
 */
export function selectedEventId(
  events: AdminEventSummary[],
  requested: string | null
) {
  return events.some((e) => e.id === requested) ? requested! : (events[0]?.id ?? "");
}
