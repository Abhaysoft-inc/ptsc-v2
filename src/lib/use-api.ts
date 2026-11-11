"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { api, errorMessage } from "@/lib/api-client";

// A small stale-while-revalidate cache for dashboard lists. Opening a tab you've
// already visited shows what it had straight away and refreshes it in the
// background, instead of a spinner while the first request repeats. Moving to
// another page of a list keeps showing the current one until the next arrives.

interface Entry {
  data?: unknown;
  error?: string;
  loading: boolean;
}

const EMPTY: Entry = { loading: false };
const entries = new Map<string, Entry>();
const listeners = new Map<string, Set<() => void>>();
const inflight = new Map<string, Promise<void>>();
// The latest data per endpoint (the URL without its query), for "keep showing the
// previous page while the next one loads".
const lastGood = new Map<string, unknown>();

const family = (url: string) => url.split("?")[0];

function notify(url: string) {
  listeners.get(url)?.forEach((listener) => listener());
}

function write(url: string, patch: Partial<Entry>) {
  entries.set(url, { ...(entries.get(url) ?? EMPTY), ...patch });
  notify(url);
}

/** Fetches `url` into the cache. Several callers asking at once share one request. */
export function fetchInto(url: string): Promise<void> {
  const existing = inflight.get(url);
  if (existing) return existing;

  write(url, { loading: true });
  const request = api<unknown>(url)
    .then((data) => {
      lastGood.set(family(url), data);
      write(url, { data, error: undefined, loading: false });
    })
    .catch((error) => write(url, { error: errorMessage(error), loading: false }))
    .finally(() => inflight.delete(url));
  inflight.set(url, request);
  return request;
}

/** Forgets everything, for example when someone signs in or out. */
export function clearApiCache() {
  const urls = [...entries.keys()];
  entries.clear();
  lastGood.clear();
  urls.forEach(notify);
}

export function useApi<T>(url: string) {
  const subscribe = useCallback(
    (listener: () => void) => {
      const set = listeners.get(url) ?? new Set();
      set.add(listener);
      listeners.set(url, set);
      return () => {
        set.delete(listener);
      };
    },
    [url]
  );
  const entry = useSyncExternalStore(
    subscribe,
    () => entries.get(url) ?? EMPTY,
    () => EMPTY
  );

  // Always revalidate when the screen opens or the URL changes.
  useEffect(() => {
    void fetchInto(url);
  }, [url]);

  const data = (entry.data ?? lastGood.get(family(url))) as T | undefined;
  return {
    data,
    error: entry.error,
    /** Nothing to show yet. */
    loading: data === undefined && !entry.error,
    /** Showing something while a newer answer is on its way. */
    refreshing: entry.loading && data !== undefined,
    reload: () => fetchInto(url),
  };
}
