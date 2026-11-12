"use client";

import { useEffect, useSyncExternalStore } from "react";
import { clearApiCache } from "@/lib/use-api";
import type { SessionUser } from "./types";

// Who is signed in, as far as the browser knows. Public pages are served from the
// CDN and can't read the visitor's cookie, so the navbar finds out after it loads.
//
// Asking the server (/api/auth/me) runs a server function, so it is avoided when it
// can't help:
//  - A readable "signed in" hint cookie (ptsc_signed_in, set at sign-in, cleared at
//    sign-out) says whether there is any session at all. Without it the visitor is
//    signed out, and nothing is asked. That is most visitors.
//  - With it, the answer is reused for a minute, so moving between pages doesn't ask
//    again each time.

/** undefined = not known yet, null = signed out. */
type State = SessionUser | null | undefined;

const HINT = "ptsc_signed_in";
// Sessions started before the hint existed have no hint; ask once per browser for those.
const MIGRATED = "ptsc_hint_checked";
const RECHECK_MS = 60_000;

let current: State = undefined;
let checkedAt = 0;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Records the signed-in user (or null after signing out) and updates every navbar. */
export function setSessionUser(user: SessionUser | null) {
  // Cached dashboard data belongs to whoever was signed in before.
  if (user?.id !== current?.id) clearApiCache();
  current = user;
  checkedAt = Date.now();
  listeners.forEach((listener) => listener());
}

const hasHint = () => document.cookie.split("; ").some((c) => c === `${HINT}=1`);

function firstVisitSinceHint() {
  try {
    if (localStorage.getItem(MIGRATED)) return false;
    localStorage.setItem(MIGRATED, "1");
    return true;
  } catch {
    return false;
  }
}

async function ask() {
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

function refresh() {
  if (!hasHint() && !firstVisitSinceHint()) {
    // No session in this browser: no need to ask the server.
    if (current !== null) setSessionUser(null);
    return;
  }
  if (current !== undefined && Date.now() - checkedAt < RECHECK_MS) return;
  inflight ??= ask().finally(() => {
    inflight = null;
  });
}

/**
 * The signed-in user, null when signed out, or undefined until it's known. Checks
 * when a component using it mounts, at most once a minute (see above).
 */
export function useSessionUser(): State {
  const user = useSyncExternalStore(subscribe, () => current, () => undefined);
  useEffect(() => {
    refresh();
  }, []);
  return user;
}
