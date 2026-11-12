"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardCheck, ExternalLink, Eye, Star, Trash2, EyeOff } from "lucide-react";
import PillTabs from "@/components/dashboard/PillTabs";
import Pagination from "@/components/dashboard/Pagination";
import { useUrlQuery } from "@/components/dashboard/useUrlQuery";
import { useDebouncedSearch } from "@/components/dashboard/useDebouncedSearch";
import { EmptyBlock, ErrorBanner, ErrorBlock, LoadingBlock, SearchInput } from "@/components/dashboard/ListStates";
import { useAdminDashboard } from "@/context/AdminDashboardContext";
import { api, errorMessage } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import type { PageInfo } from "@/lib/types/admin";
import type { BlogCounts, BlogRow } from "@/lib/types/blog";
import { Badge, StatusBadges, dangerButton, rowButton, shortDate } from "./blog-ui";

const VIEWS = ["queue", "published", "draft", "rejected", "all"] as const;
type View = (typeof VIEWS)[number];
const LABEL: Record<View, string> = {
  queue: "Review queue",
  published: "Published",
  draft: "Drafts",
  rejected: "Sent back",
  all: "All",
};

interface Response extends PageInfo {
  posts: BlogRow[];
  counts: BlogCounts;
}

/** For admins and members: posts waiting for review, and everything else on the blog. */
export default function ReviewView() {
  const { currentUser } = useAdminDashboard();
  const { params, page, setQuery } = useUrlQuery();
  const view: View = VIEWS.find((v) => v === params.get("status")) ?? "queue";
  const q = params.get("q") ?? "";
  const [search, setSearch] = useDebouncedSearch(q, (value) => setQuery({ q: value, page: null }));

  const query = new URLSearchParams({ status: view, page: String(page) });
  if (q) query.set("q", q);
  const { data, error, loading, refreshing, reload } = useApi<Response>(`/api/admin/blogs?${query}`);

  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const run = async (id: string, fn: () => Promise<unknown>) => {
    setBusy(id);
    setActionError(null);
    try {
      await fn();
      await reload();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const feature = (post: BlogRow) =>
    run(post.id, () =>
      api(`/api/admin/blogs/${post.id}`, { method: "PATCH", body: JSON.stringify({ featured: !post.featured }) })
    );
  const unpublish = (post: BlogRow) => {
    if (!window.confirm(`Take "${post.title}" off the site? It goes back to a draft for its author.`)) return;
    return run(post.id, () =>
      api(`/api/admin/blogs/${post.id}/review`, { method: "POST", body: JSON.stringify({ action: "unpublish" }) })
    );
  };
  const remove = (post: BlogRow) => {
    if (!window.confirm(`Delete "${post.title}" for good? This can't be undone.`)) return;
    return run(post.id, () => api(`/api/blogs/mine/${post.id}`, { method: "DELETE" }));
  };

  if (error && !data) return <ErrorBlock title="Couldn't load the posts" message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingBlock label="Loading posts…" />;

  const counts: Partial<Record<View, number>> = {
    queue: data.counts.queue,
    published: data.counts.published,
    draft: data.counts.draft,
    rejected: data.counts.rejected,
  };
  const labels = VIEWS.map((v) => (counts[v] !== undefined ? `${LABEL[v]} (${counts[v]})` : LABEL[v]));
  const labelOf = (v: View) => labels[VIEWS.indexOf(v)];

  return (
    <div className="space-y-5">
      {actionError && <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <PillTabs
          label="Filter posts"
          options={labels}
          value={labelOf(view)}
          onChange={(next) => setQuery({ status: VIEWS[labels.indexOf(next)] === "queue" ? null : VIEWS[labels.indexOf(next)], page: null })}
        />
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title" />
      </div>

      {data.posts.length === 0 ? (
        <EmptyBlock
          icon={ClipboardCheck}
          title={view === "queue" && !q ? "Nothing is waiting for review" : "No posts here"}
          hint={view === "queue" && !q ? "New submissions and edits show up here." : "Try another filter or search."}
        />
      ) : (
        <ul
          aria-busy={refreshing}
          className={`divide-y divide-white/[0.06] border-y border-white/[0.06] transition-opacity ${
            refreshing ? "opacity-60" : ""
          }`}
        >
          {data.posts.map((post) => (
            <li key={post.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Link href={`/dashboard/blog/${post.id}/review`} className="text-sm font-semibold text-white hover:underline">
                  {post.title}
                </Link>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {post.reviewKind && (
                    <Badge tone="amber">{post.reviewKind === "edit" ? "Edit to review" : "New post"}</Badge>
                  )}
                  <StatusBadges post={post} />
                  {post.featured && <Badge tone="blue">Featured</Badge>}
                  <span className="font-mono text-[11px] text-neutral-500">
                    {post.authorName} · {post.category} ·{" "}
                    {post.reviewKind
                      ? `sent ${shortDate(post.revision?.submittedAt ?? post.submittedAt)}`
                      : `updated ${shortDate(post.updatedAt)}`}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-1">
                <Link href={`/dashboard/blog/${post.id}/review`} className={rowButton}>
                  <Eye className="h-3.5 w-3.5" /> {post.reviewKind ? "Review" : "Open"}
                </Link>
                {post.status === "published" && post.slug && (
                  <a href={`/blogs/${post.slug}`} target="_blank" rel="noreferrer" className={rowButton}>
                    <ExternalLink className="h-3.5 w-3.5" /> View
                  </a>
                )}
                {post.status === "published" && (
                  <>
                    <button
                      type="button"
                      disabled={busy === post.id}
                      onClick={() => feature(post)}
                      className={rowButton}
                      aria-pressed={post.featured}
                    >
                      <Star className={`h-3.5 w-3.5 ${post.featured ? "fill-amber-400 text-amber-400" : ""}`} />
                      {post.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button type="button" disabled={busy === post.id} onClick={() => unpublish(post)} className={dangerButton}>
                      <EyeOff className="h-3.5 w-3.5" /> Unpublish
                    </button>
                  </>
                )}
                {currentUser.role === "admin" && (
                  <button
                    type="button"
                    disabled={busy === post.id}
                    onClick={() => remove(post)}
                    aria-label={`Delete ${post.title}`}
                    className={dangerButton}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination info={data} onPageChange={(next) => setQuery({ page: next })} loading={refreshing} noun={["post", "posts"]} />
    </div>
  );
}
