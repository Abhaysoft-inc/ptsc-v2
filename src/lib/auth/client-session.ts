"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { SessionUser } from "./types";

// Who is signed in, as far as the browser knows. Pages like the home page are
// built ahead of time and can't read the visitor's cookie, so the navbar asks
// /api/auth/me after it loads. The answer is kept here so moving between pages
// doesn't flash the wrong button, and sign in / sign out update it directly.

/** undefined = not asked yet, null = signed out. */
type State = SessionUser | null | undefined;

let current: State = undefined;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Records the signed-in user (or null after signing out) and updates every navbar. */
export function setSessionUser(user: SessionUser | null) {
  current = user;
  listeners.forEach((listener) => listener());
}

async function refresh() {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setSessionUser(data.user ?? null);
    } else if (res.status === 401 || current === undefined) {
      setSessionUser(null);
    }
  } catch {
    // Offline or the server is down: assume signed out rather than show nothing.
    if (current === undefined) setSessionUser(null);
  }
}

/**
 * The signed-in user, null when signed out, or undefined until the first answer
 * arrives. Re-checks with the server each time a component using it mounts, so a
 * stale answer is corrected right away.
 */
export function useSessionUser(): State {
  const user = useSyncExternalStore(subscribe, () => current, () => undefined);
  useEffect(() => {
    void refresh();
  }, []);
  return user;
}
