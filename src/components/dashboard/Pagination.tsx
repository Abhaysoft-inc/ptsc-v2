"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { PageInfo } from "@/lib/types/admin";

interface PaginationProps {
  info: PageInfo;
  onPageChange: (page: number) => void;
  loading?: boolean;
  /** Singular and plural names for the rows, e.g. ["user", "users"]. */
  noun: [string, string];
}

// "Showing 21–40 of 130 users" with page buttons like 1 … 4 5 6 … 12.
export default function Pagination({
  info,
  onPageChange,
  loading = false,
  noun,
}: PaginationProps) {
  const { page, pageSize, total, totalPages } = info;
  if (total === 0) return null;

  const firstShown = (page - 1) * pageSize + 1;
  const lastShown = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400">
      <p className="flex items-center gap-2">
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        <span>
          Showing{" "}
          <span className="text-white font-medium">
            {firstShown}–{lastShown}
          </span>{" "}
          of <span className="text-white font-medium">{total}</span>{" "}
          {total === 1 ? noun[0] : noun[1]}
        </span>
      </p>

      {totalPages > 1 && (
        <nav aria-label="Pages" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            aria-label="Previous page"
            className="p-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageNumbers(page, totalPages).map((n, i) =>
            n === null ? (
              <span key={`gap-${i}`} className="px-1.5 text-neutral-600">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => onPageChange(n)}
                disabled={loading}
                aria-current={n === page ? "page" : undefined}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  n === page
                    ? "bg-white text-black"
                    : "text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {n}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            aria-label="Next page"
            className="p-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
}

// Page buttons with gaps, e.g. 1 … 4 5 6 … 12. null marks a gap; a gap of a
// single page shows that page instead of "…".
function pageNumbers(page: number, totalPages: number): (number | null)[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...wanted]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) {
      out.push(n - sorted[i - 1] === 2 ? n - 1 : null);
    }
    out.push(n);
  });
  return out;
}
