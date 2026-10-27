"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Reads and updates list state (page, search, filters, selected event) kept in
 * the URL, so a refresh or the back button keeps your place. Callers must
 * render inside a <Suspense> boundary because of useSearchParams.
 *
 *   const { params, setQuery } = useUrlQuery();
 *   setQuery({ q: "abhay", page: null }); // null or "" removes a key
 */
export function useUrlQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setQuery = useCallback(
    (changes: Record<string, string | number | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        // page=1 is the default, so keep the URL clean without it.
        if (value === null || value === "" || (key === "page" && value === 1)) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  const page = Math.max(1, Number(params.get("page")) || 1);

  return { params, page, setQuery };
}
