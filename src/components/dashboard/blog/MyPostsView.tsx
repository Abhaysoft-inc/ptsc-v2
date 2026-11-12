"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, FileText, Pencil, Plus, Send, Trash2, Undo2 } from "lucide-react";
import PillTabs from "@/components/dashboard/PillTabs";
import Pagination from "@/components/dashboard/Pagination";
import { useUrlQuery } from "@/components/dashboard/useUrlQuery";
import { EmptyBlock, ErrorBanner, ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { api, errorMessage } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import { authorCanDelete } from "@/lib/blog-rules";
import type { PageInfo } from "@/lib/types/admin";
import type { BlogRow } from "@/lib/types/blog";
import { StatusBadges, dangerButton, primaryButton, rowButton, shortDate } from "./blog-ui";

const FILTERS = ["All", "Drafts", "In review", "Published", "Needs changes"] as const;
type Filter = (typeof FILTERS)[number];
const STATUS_OF: Record<Filter, string | null> = {
  All: null,
  Drafts: "draft",
  "In review": "pending",
  Published: "published",
  "Needs changes": "rejected",
};

interface Response extends PageInfo {
  posts: BlogRow[];
}

/** The signed-in user's own posts, whatever their state. */
export default function MyPostsView() {
  const { params, page, setQuery } = useUrlQuery();
  const filter: Filter = FILTERS.find((f) => STATUS_OF[f] === params.get("status")) ?? "All";
  const status = STATUS_OF[filter];

  const query = new URLSearchParams({ page: String(page) });
  if (status) query.set("status", status);
  const { data, error, loading, refreshing, reload } = useApi<Response>(`/api/blogs/mine?${query}`);

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

  const withdraw = (post: BlogRow) =>
    run(post.id, () => api(`/api/blogs/mine/${post.id}/withdraw`, { method: "POST" }));
  const remove = (post: BlogRow) => {
    if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    return run(post.id, () => api(`/api/blogs/mine/${post.id}`, { method: "DELETE" }));
  };

  if (error && !data) return <ErrorBlock title="Couldn't load your posts" message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingBlock label="Loading your posts…" />;

  return (
    <div className="space-y-5">
      {actionError && <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PillTabs
          label="Filter your posts"
          options={FILTERS}
          value={filter}
          onChange={(next) => setQuery({ status: STATUS_OF[next], page: null })}
        />
        <Link href="/dashboard/blog/new" className={`${primaryButton} shrink-0`}>
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          Write a post
        </Link>
      </div>

      {data.posts.length === 0 ? (
        <EmptyBlock
          icon={FileText}
          title={filter === "All" ? "You haven't written anything yet" : "No posts here"}
          hint={
            filter === "All"
              ? "Write your first post. It goes live once a reviewer approves it."
              : "Try another filter."
          }
        />
      ) : (
        <ul
          aria-busy={refreshing}
          className={`divide-y divide-white/[0.06] border-y border-white/[0.06] transition-opacity ${
            refreshing ? "opacity-60" : ""
          }`}
        >
          {data.posts.map((post) => {
            const waiting = post.status === "pending" || post.revision?.state === "pending";
            const note =
              post.status === "rejected"
                ? post.reviewNote
                : post.revision?.state === "rejected"
                  ? post.revision.reviewNote
                  : "";
            return (
              <li key={post.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/blog/${post.id}/edit`}
                    className="text-sm font-semibold text-white hover:underline"
                  >
                    {post.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <StatusBadges post={post} />
                    <span className="font-mono text-[11px] text-neutral-500">
                      {post.category} · {post.readMinutes} min · updated {shortDate(post.updatedAt)}
                    </span>
                  </div>
                  {note && (
                    <p className="mt-2 max-w-2xl rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                      <span className="font-semibold">Reviewer&apos;s note: </span>
                      {note}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  {post.status === "published" && post.slug && (
                    <a href={`/blogs/${post.slug}`} target="_blank" rel="noreferrer" className={rowButton}>
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </a>
                  )}
                  {waiting ? (
                    <button type="button" disabled={busy === post.id} onClick={() => withdraw(post)} className={rowButton}>
                      <Undo2 className="h-3.5 w-3.5" /> Withdraw
                    </button>
                  ) : (
                    <Link href={`/dashboard/blog/${post.id}/edit`} className={rowButton}>
                      {post.status === "draft" || post.status === "rejected" ? (
                        <>
                          <Send className="h-3.5 w-3.5" /> Continue
                        </>
                      ) : (
                        <>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </>
                      )}
                    </Link>
                  )}
                  {authorCanDelete(post.status) && (
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
            );
          })}
        </ul>
      )}

      <Pagination info={data} onPageChange={(next) => setQuery({ page: next })} loading={refreshing} noun={["post", "posts"]} />
    </div>
  );
}
