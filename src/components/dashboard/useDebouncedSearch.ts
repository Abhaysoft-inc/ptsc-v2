"use client";

import { useEffect, useState } from "react";

/**
 * Lets a search box update instantly while only committing (e.g. to the URL)
 * 300 ms after the last keystroke. Re-syncs if the committed value changes
 * from elsewhere, such as the back button.
 */
export function useDebouncedSearch(
  committed: string,
  commit: (value: string) => void,
  delay = 300
) {
  const [input, setInput] = useState(committed);
  const [lastCommitted, setLastCommitted] = useState(committed);

  // The URL changed without typing (back button): show its value.
  if (committed !== lastCommitted) {
    setLastCommitted(committed);
    setInput(committed);
  }

  useEffect(() => {
    if (input.trim() === committed) return;
    const timer = setTimeout(() => commit(input.trim()), delay);
    return () => clearTimeout(timer);
  }, [input, committed, commit, delay]);

  return [input, setInput] as const;
}
