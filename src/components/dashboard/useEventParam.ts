"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Keeps the selected event in the URL (`?event=evt-2`) so a reload, a shared
 * link, or the back button lands on the same event. Falls back to the first
 * event when the param is missing or stale. Callers must render inside a
 * <Suspense> boundary because of useSearchParams.
 */
export function useEventParam(
  events: { id: string }[]
): [string, (eventId: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const requested = params.get("event");
  const eventId =
    requested && events.some((e) => e.id === requested)
      ? requested
      : events[0]?.id ?? "";

  const setEventId = (next: string) => {
    const query = new URLSearchParams(params.toString());
    query.set("event", next);
    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
  };

  return [eventId, setEventId];
}
