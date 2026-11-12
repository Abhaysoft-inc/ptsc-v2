"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ExternalLink, Loader2, MessageSquareWarning, Pencil } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Markdown from "@/components/blog/Markdown";
import { ErrorBanner, ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { api, errorMessage } from "@/lib/api-client";
import { readMinutes } from "@/lib/blog-text";
import type { BlogDetail, BlogFields } from "@/lib/types/blog";
import { Badge, StatusBadges, dangerButton, primaryButton, shortDate } from "./blog-ui";

const BACK = "/dashboard/blog?view=review";

/** Which of the editable fields differ between two versions. */
function changedFields(next: BlogFields, live: BlogFields) {
  const labels: [keyof BlogFields, string][] = [
    ["title", "Title"],
    ["excerpt", "Summary"],
    ["content", "Content"],
    ["category", "Category"],
    ["tags", "Tags"],
    ["coverImageUrl", "Cover image"],
    ["coverAlt", "Cover alt text"],
    ["seoTitle", "Search title"],
    ["seoDescription", "Search description"],
  ];
  return labels.filter(([key]) => JSON.stringify(next[key]) !== JSON.stringify(live[key])).map(([, label]) => label);
}

/** A reviewer's view of one post: read it as readers will, then approve it or send it back. */
export default function BlogReview({ postId }: { postId: string }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [version, setVersion] = useState<"proposed" | "live">("proposed");
  const [note, setNote] = useState("");
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState<null | "approve" | "reject" | "unpublish">(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<{ blog: BlogDetail }>(`/api/admin/blogs/${postId}`)
      .then((data) => !cancelled && setPost(data.blog))
      .catch((e) => !cancelled && setLoadError(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const act = async (action: "approve" | "reject" | "unpublish", leave: boolean) => {
    setBusy(action);
    setError(null);
    try {
      const res = await api<{ blog: BlogDetail }>(`/api/admin/blogs/${postId}/review`, {
        method: "POST",
        body: JSON.stringify({ action, note: action === "reject" ? note : undefined }),
      });
      if (leave) router.push(BACK);
      else {
        setPost(res.blog);
        setVersion("proposed");
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const unpublish = () => {
    if (!window.confirm("Take this post off the site? It goes back to a draft for its author.")) return;
    void act("unpublish", false);
  };

  const showing: BlogFields | null = post ? (version === "live" && post.live ? post.live : post.fields) : null;
  const changes = post?.live ? changedFields(post.fields, post.live) : [];
  const waiting = post?.reviewKind !== null && post?.reviewKind !== undefined;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#080809] text-white selection:bg-white selection:text-black">
      <Navbar />
      <main className="px-6 pb-20 pt-28 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href={BACK}
            className="group mb-6 inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to review
          </Link>

          {loadError ? (
            <ErrorBlock title="Couldn't open this post" message={loadError} />
          ) : !post || !showing ? (
            <LoadingBlock label="Loading post…" />
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {post.reviewKind && (
                    <Badge tone="amber">{post.reviewKind === "edit" ? "Edit to review" : "New post"}</Badge>
                  )}
                  <StatusBadges post={post} />
                </div>

                {post.live && (
                  <div role="tablist" aria-label="Version" className="mt-5 inline-flex rounded-lg bg-white/[0.04] p-0.5">
                    {(["proposed", "live"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="tab"
                        aria-selected={version === t}
                        onClick={() => setVersion(t)}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                          version === t ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        {t === "proposed" ? "Proposed edit" : "Live now"}
                      </button>
                    ))}
                  </div>
                )}

                <article className="mt-6">
                  <p className="font-mono text-xs uppercase tracking-wider text-emerald-400">{showing.category}</p>
                  <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                    {showing.title}
                  </h1>
                  {showing.excerpt && <p className="mt-4 text-base leading-relaxed text-neutral-400">{showing.excerpt}</p>}
                  <p className="mt-4 text-sm text-neutral-500">
                    By <span className="text-neutral-300">{post.authorName}</span> · {readMinutes(showing.content)} min read
                  </p>
                  {showing.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- a preview of whatever link was given
                    <img
                      src={showing.coverImageUrl}
                      alt={showing.coverAlt}
                      className="mt-8 aspect-[16/9] w-full rounded-2xl border border-white/10 object-cover"
                    />
                  )}
                  <div className="mt-8 text-[17px]">
                    <Markdown>{showing.content}</Markdown>
                  </div>
                </article>
              </div>

              <aside className="space-y-6">
                {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

                {waiting ? (
                  <section className="space-y-3 rounded-2xl border border-white/10 p-5">
                    <h2 className="text-sm font-semibold text-white">
                      {post.reviewKind === "edit" ? "Review this edit" : "Review this post"}
                    </h2>
                    <p className="text-xs leading-relaxed text-neutral-400">
                      {post.reviewKind === "edit"
                        ? "Approving replaces the live post with this version. Until then, readers see the old one."
                        : "Approving publishes it at its own address, visible to everyone."}
                    </p>
                    <button
                      type="button"
                      onClick={() => act("approve", true)}
                      disabled={busy !== null}
                      className={`${primaryButton} w-full`}
                    >
                      {busy === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      {post.reviewKind === "edit" ? "Approve edit" : "Approve & publish"}
                    </button>

                    {asking ? (
                      <div className="space-y-2">
                        <label htmlFor="review-note" className="text-xs font-medium text-neutral-200">
                          What should the author change?
                        </label>
                        <textarea
                          id="review-note"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          maxLength={500}
                          rows={4}
                          autoFocus
                          className="w-full resize-y rounded-xl border border-white/10 bg-[#18181b] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none"
                          placeholder="Be specific and kind. The author sees this."
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => act("reject", true)}
                            disabled={busy !== null || note.trim().length < 3}
                            className={`${primaryButton} flex-1`}
                          >
                            {busy === "reject" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Send back
                          </button>
                          <button
                            type="button"
                            onClick={() => setAsking(false)}
                            className="rounded-xl px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAsking(true)}
                        disabled={busy !== null}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10 cursor-pointer disabled:opacity-60"
                      >
                        <MessageSquareWarning className="h-3.5 w-3.5" />
                        Request changes
                      </button>
                    )}
                  </section>
                ) : (
                  <p className="rounded-2xl border border-white/10 p-5 text-xs leading-relaxed text-neutral-400">
                    {post.status === "published"
                      ? "Nothing is waiting for review on this post."
                      : post.status === "rejected"
                        ? "This was sent back to its author and is waiting for their changes."
                        : "This is still a draft. The author hasn't sent it for review."}
                  </p>
                )}

                {changes.length > 0 && (
                  <section className="space-y-2">
                    <h2 className="text-sm font-semibold text-white">What changed</h2>
                    <ul className="list-disc space-y-1 pl-4 text-xs text-neutral-300 marker:text-neutral-600">
                      {changes.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="space-y-2 border-t border-white/10 pt-5 text-xs text-neutral-400">
                  <h2 className="text-sm font-semibold text-white">Details</h2>
                  <p>Author: {post.authorName}</p>
                  <p>Last updated: {shortDate(post.updatedAt)}</p>
                  {post.publishedAt && <p>Published: {shortDate(post.publishedAt)}</p>}
                  {showing.tags.length > 0 && <p>Tags: {showing.tags.map((t) => `#${t}`).join(" ")}</p>}
                  <p>Search title: {showing.seoTitle || <span className="text-neutral-600">uses the post title</span>}</p>
                  <p>
                    Search description:{" "}
                    {showing.seoDescription || <span className="text-neutral-600">uses the summary</span>}
                  </p>
                </section>

                <div className="flex flex-wrap items-center gap-2">
                  {post.status === "published" && post.slug && (
                    <a
                      href={`/blogs/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View live
                    </a>
                  )}
                  {post.status === "published" && (
                    <Link
                      href={`/dashboard/blog/${post.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit live post
                    </Link>
                  )}
                  {post.status === "published" && (
                    <button type="button" onClick={unpublish} disabled={busy !== null} className={dangerButton}>
                      Unpublish
                    </button>
                  )}
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
