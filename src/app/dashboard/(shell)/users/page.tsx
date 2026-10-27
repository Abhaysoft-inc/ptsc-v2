"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import AdminUsersView, {
  USER_STATUS_FILTERS,
  type UserStatusFilter,
  type UsersPageInfo,
} from "@/components/dashboard/AdminUsersView";
import type { AdminUser } from "@/lib/dashboard";

type Edits = Pick<AdminUser, "role" | "batch" | "post">;

interface UsersResponse extends UsersPageInfo {
  users: AdminUser[];
  currentUserId: string;
}

// Calls an admin API route; returns the parsed body, or throws with the
// server's message.
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message ?? "Something went wrong. Please try again.");
  }
  return data as T;
}

function UsersRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Page, search and filter live in the URL (?page=2&q=abhay&status=pending)
  // so a refresh or the back button keeps your place.
  const page = Math.max(1, Number(params.get("page")) || 1);
  const q = params.get("q") ?? "";
  const statusParam = params.get("status");
  const statusFilter: UserStatusFilter =
    USER_STATUS_FILTERS.find((f) => f.toLowerCase() === statusParam) ?? "All";

  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowSignup, setAllowSignup] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // What's in the search box; written to the URL after a short pause.
  const [searchInput, setSearchInput] = useState(q);

  const setQuery = useCallback(
    (changes: Record<string, string | number | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
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

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const query = new URLSearchParams({ page: String(page) });
    if (q) query.set("q", q);
    if (statusFilter !== "All") query.set("status", statusFilter.toLowerCase());
    try {
      const result = await api<UsersResponse>(`/api/admin/users?${query}`);
      setData(result);
      // The server clamps an out-of-range page; keep the URL in step.
      if (result.page !== page) setQuery({ page: result.page });
    } catch (error) {
      setLoadError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, q, statusFilter, setQuery]);

  useEffect(() => {
    // Fetches whenever the page, search or filter in the URL changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    api<{ allowSignup: boolean }>("/api/admin/settings")
      .then((s) => setAllowSignup(s.allowSignup))
      .catch(() => {}); // the toggle just shows the default; the list matters more
  }, []);

  // Debounce typing, and go back to page 1 for a new search.
  useEffect(() => {
    if (searchInput.trim() === q) return;
    const timer = setTimeout(
      () => setQuery({ q: searchInput.trim(), page: null }),
      300
    );
    return () => clearTimeout(timer);
  }, [searchInput, q, setQuery]);

  // Runs a mutation, then refetches so counts and paging stay correct (for
  // example, approving someone while filtered to Pending removes their row).
  const run = async (action: () => Promise<unknown>, refetch = true) => {
    setActionError(null);
    try {
      await action();
      if (refetch) await load();
      return true;
    } catch (error) {
      setActionError((error as Error).message);
      return false;
    }
  };

  if (loadError && !data) {
    return (
      <div className="flex flex-col items-center text-center py-16 rounded-2xl bg-[#111113] border border-white/10">
        <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
        <p className="text-sm font-semibold text-white">Couldn&apos;t load users</p>
        <p className="text-xs text-neutral-400 mt-1">{loadError}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try again</span>
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-xs text-neutral-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading users…</span>
      </div>
    );
  }

  const error = actionError ?? loadError;

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setActionError(null);
              setLoadError(null);
            }}
            className="text-red-300 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <AdminUsersView
        users={data.users}
        currentUserId={data.currentUserId}
        allowSignup={allowSignup}
        onToggleSignup={(allow) =>
          run(async () => {
            await api("/api/admin/settings", {
              method: "PATCH",
              body: JSON.stringify({ allowSignup: allow }),
            });
            setAllowSignup(allow);
          }, false)
        }
        onApprove={(id) =>
          run(() =>
            api(`/api/admin/users/${id}`, {
              method: "PATCH",
              body: JSON.stringify({ action: "approve" }),
            })
          )
        }
        onSave={(id, changes: Edits) =>
          run(() =>
            api(`/api/admin/users/${id}`, {
              method: "PATCH",
              body: JSON.stringify(changes),
            })
          )
        }
        onDelete={(id) =>
          run(() => api(`/api/admin/users/${id}`, { method: "DELETE" }))
        }
        search={searchInput}
        onSearchChange={setSearchInput}
        statusFilter={statusFilter}
        onStatusFilterChange={(filter) =>
          setQuery({
            status: filter === "All" ? null : filter.toLowerCase(),
            page: null,
          })
        }
        pageInfo={data}
        onPageChange={(n) => setQuery({ page: n })}
        loading={loading}
      />
    </div>
  );
}

export default function UsersPage() {
  // useSearchParams needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <UsersRoute />
    </Suspense>
  );
}
