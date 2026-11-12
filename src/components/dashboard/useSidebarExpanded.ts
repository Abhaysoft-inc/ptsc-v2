"use client";

import { useCallback, useSyncExternalStore } from "react";

// Whether the dashboard sidebar shows labels (expanded) or icons only, remembered in
// this browser. Expanded is the default. Only applies from the md breakpoint up; on
// phones the sidebar is always the icon rail.

const KEY = "ptsc-sidebar-expanded";
const listeners = new Set<() => void>();

function read() {
  try {
    return localStorage.getItem(KEY) !== "0";
  } catch {
    return true;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSidebarExpanded() {
  // The server renders it expanded; a saved "collapsed" applies right after load.
  const expanded = useSyncExternalStore(subscribe, read, () => true);
  const toggle = useCallback(() => {
    try {
      localStorage.setItem(KEY, read() ? "0" : "1");
    } catch {
      /* storage blocked: nothing to remember */
    }
    listeners.forEach((l) => l());
  }, []);
  return { expanded, toggle };
}
