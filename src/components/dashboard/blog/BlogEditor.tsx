"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bold,
  Code,
  FileCode2,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Send,
  Undo2,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Dropdown from "@/components/ui/dropdown";
import Markdown from "@/components/blog/Markdown";
import { ErrorBanner, ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { Field, FieldError, inputClass } from "@/components/dashboard/event-form/FormParts";
import { useAdminDashboard } from "@/context/AdminDashboardContext";
import { ApiError, api, detailedErrorMessage, errorMessage } from "@/lib/api-client";
import { uploadImage } from "@/lib/upload-client";
import { countWords, readMinutes, slugify } from "@/lib/blog-text";
import { MIN_CONTENT_CHARS, submitProblems } from "@/lib/blog-rules";
import { useApi } from "@/lib/use-api";
import type { BlogCategoryRow, BlogDetail, BlogFields } from "@/lib/types/blog";
import { StatusBadges, primaryButton } from "./blog-ui";

const BACK = "/dashboard/blog";
const BLOG_SIGN = "/api/blogs/uploads/sign";
const DRAFT_KEY = "ptsc-blog-draft";
const NEW_CATEGORY = "__new__";

const EMPTY: BlogFields = {
  title: "",
  excerpt: "",
  content: "",
  category: "Other",
  tags: [],
  coverImageUrl: "",
  coverAlt: "",
  seoTitle: "",
  seoDescription: "",
};

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

const noopSubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

// An unsaved new post is kept in this browser, so a closed tab doesn't lose it.
function readLocalDraft(): BlogFields | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BlogFields>;
    return { ...EMPTY, ...parsed, tags: Array.isArray(parsed.tags) ? parsed.tags : [] };
  } catch {
    return null;
  }
}
function writeLocalDraft(fields: BlogFields) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(fields));
  } catch {
    /* storage can be unavailable; the post is still safe once saved */
  }
}
function clearLocalDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

// ------------------------------------------------------------- loader ----

/** The write / edit screen. Pass `postId` to edit. */
export default function BlogEditor({ postId }: { postId?: string }) {
  const isClient = useIsClient();
  const [detail, setDetail] = useState<BlogDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    api<{ blog: BlogDetail }>(`/api/blogs/mine/${postId}`)
      .then((data) => !cancelled && setDetail(data.blog))
      .catch((e) => !cancelled && setLoadError(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [postId]);

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
            Back to Blog
          </Link>

          {loadError ? (
            <ErrorBlock title="Couldn't open this post" message={loadError} />
          ) : !isClient || (postId && !detail) ? (
            <LoadingBlock label={postId ? "Loading post…" : "Loading editor…"} />
          ) : (
            <EditorForm key={detail?.id ?? "new"} detail={detail} onDetail={setDetail} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// --------------------------------------------------------------- form ----

function EditorForm({
  detail,
  onDetail,
}: {
  detail: BlogDetail | null;
  onDetail: (detail: BlogDetail) => void;
}) {
  const router = useRouter();
  const { currentUser } = useAdminDashboard();
  const reviewer = currentUser.role !== "normal";

  const isAuthor = !detail || detail.authorId === currentUser.id;
  const status = detail?.status ?? "draft";
  // A reviewer's edit to a published post goes live straight away.
  const directLive = reviewer && status === "published";
  // An author's post that is waiting for review can't be changed until it is withdrawn.
  const locked =
    isAuthor &&
    !directLive &&
    (status === "pending" || (status === "published" && detail?.revision?.state === "pending"));
  const canEdit = (isAuthor || directLive) && !locked;
  const editingLive = status === "published" && !directLive;

  const [restored] = useState(() => (detail ? null : readLocalDraft()));
  const initial: BlogFields = detail ? (directLive ? (detail.live ?? detail.fields) : detail.fields) : (restored ?? EMPTY);
  const [v, setV] = useState<BlogFields>(initial);
  // What was last saved, to tell whether there is anything unsaved.
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = JSON.stringify(v) !== baseline;

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState<null | "save" | "submit" | "withdraw" | "discard">(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = useCallback(<K extends keyof BlogFields>(key: K, value: BlogFields[K]) => {
    setV((prev) => ({ ...prev, [key]: value }));
    setNotice(null);
  }, []);

  // Keep a new post in this browser while it is being written.
  useEffect(() => {
    if (detail || !dirty) return;
    const timer = setTimeout(() => writeLocalDraft(v), 500);
    return () => clearTimeout(timer);
  }, [v, dirty, detail]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty || !canEdit) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, canEdit]);

  const problems = useMemo(() => submitProblems(v), [v]);
  const words = countWords(v.content);

  /** Saves the post and returns it. A new post is created; an existing one is updated. */
  const persist = async (): Promise<BlogDetail> => {
    const body = JSON.stringify(v);
    if (!detail) {
      const res = await api<{ blog: BlogDetail }>("/api/blogs/mine", { method: "POST", body });
      clearLocalDraft();
      return res.blog;
    }
    const res = await api<{ blog: BlogDetail }>(`/api/blogs/mine/${detail.id}`, { method: "PATCH", body });
    return res.blog;
  };

  const fail = (e: unknown) => {
    setError(detailedErrorMessage(e));
    setFieldErrors(e instanceof ApiError && e.errors ? e.errors : {});
  };

  const saved = (blog: BlogDetail) => {
    setBaseline(JSON.stringify(v));
    onDetail(blog);
  };

  const saveDraft = async () => {
    setBusy("save");
    setError(null);
    setFieldErrors({});
    try {
      const blog = await persist();
      if (!detail) {
        // Now it has an address of its own.
        setBaseline(JSON.stringify(v));
        router.replace(`/dashboard/blog/${blog.id}/edit`);
        return;
      }
      saved(blog);
      setNotice(directLive ? "Saved. The live post is updated." : "Saved.");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  };

  const submit = async () => {
    if (problems.length) {
      setError(problems.join(" "));
      return;
    }
    setBusy("submit");
    setError(null);
    setFieldErrors({});
    try {
      const blog = await persist();
      await api(`/api/blogs/mine/${blog.id}/submit`, { method: "POST" });
      setBaseline(JSON.stringify(v));
      router.push(BACK);
    } catch (e) {
      fail(e);
      setBusy(null);
    }
  };

  const withdraw = async () => {
    if (!detail) return;
    setBusy("withdraw");
    setError(null);
    try {
      const res = await api<{ blog: BlogDetail }>(`/api/blogs/mine/${detail.id}/withdraw`, { method: "POST" });
      onDetail(res.blog);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  };

  const discardEdit = async () => {
    if (!detail || !window.confirm("Discard your edit? The published post stays as it is.")) return;
    setBusy("discard");
    setError(null);
    try {
      const res = await api<{ blog: BlogDetail }>(`/api/blogs/mine/${detail.id}/revision`, { method: "DELETE" });
      onDetail(res.blog);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  };

  // ---- banners for the post's state
  const reviewNote =
    detail?.status === "rejected"
      ? detail.reviewNote
      : detail?.revision?.state === "rejected"
        ? detail.revision.reviewNote
        : "";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {!detail ? "Write a post" : directLive ? "Edit live post" : editingLive ? "Edit published post" : "Edit post"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {detail && <StatusBadges post={detail} />}
            <span className="font-mono text-[11px] text-neutral-500">
              {words} words · {readMinutes(v.content)} min read
            </span>
          </div>
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={saveDraft} disabled={busy !== null} className={secondaryButton}>
              {busy === "save" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {directLive ? "Save changes" : "Save draft"}
            </button>
            {!directLive && (
              <button type="button" onClick={submit} disabled={busy !== null} className={primaryButton}>
                {busy === "submit" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {editingLive ? "Submit edit for review" : "Submit for review"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-6 space-y-3">
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        {notice && (
          <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400">
            {notice}
          </p>
        )}
        {restored && !detail && (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-neutral-300">
            Restored your unsaved draft from this browser.
          </p>
        )}
        {reviewNote && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-300">
            <span className="font-semibold">A reviewer asked for changes: </span>
            {reviewNote}
          </p>
        )}
        {editingLive && !locked && (
          <p className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs text-blue-300">
            This post is live. Your changes are saved as a separate version, and the live post stays exactly as it is until a
            reviewer approves them.
          </p>
        )}
        {directLive && (
          <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
            You&apos;re a reviewer, so saving updates the live post straight away.
          </p>
        )}
        {locked && (
          <div className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300 sm:flex-row sm:items-center sm:justify-between">
            <span>It&apos;s waiting for a reviewer, so it can&apos;t be edited. Withdraw it to make changes.</span>
            <button type="button" onClick={withdraw} disabled={busy !== null} className={secondaryButton}>
              {busy === "withdraw" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
              Withdraw
            </button>
          </div>
        )}
        {!isAuthor && !directLive && detail && (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-neutral-300">
            This is {detail.authorName}&apos;s post. Only they can edit it until it&apos;s published.{" "}
            <Link href={`/dashboard/blog/${detail.id}/review`} className="font-semibold text-white underline underline-offset-4">
              Open it for review
            </Link>
          </p>
        )}
      </div>

      <fieldset disabled={!canEdit} className="grid min-w-0 gap-8 lg:grid-cols-[1fr_20rem]">
        {/* ---- the post */}
        <div className="min-w-0 space-y-6">
          <Field
            id="blog-title"
            label="Title"
            required
            error={fieldErrors.title}
            aside={`${v.title.length}/150`}
          >
            <input
              id="blog-title"
              value={v.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={150}
              placeholder="A clear title that says what the reader gets"
              className={`${inputClass} text-base font-semibold`}
            />
          </Field>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-neutral-200">Post</span>
              <div role="tablist" aria-label="Editor mode" className="inline-flex rounded-lg bg-white/[0.04] p-0.5">
                {(["write", "preview"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => setTab(t)}
                    className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors cursor-pointer ${
                      tab === t ? "bg-white/10 text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {tab === "write" ? (
              <ContentEditor value={v.content} onChange={(next) => set("content", next)} onError={setError} />
            ) : (
              <div className="min-h-[24rem] rounded-xl border border-white/10 bg-[#0e0e11] p-5 sm:p-6">
                {v.content.trim() ? (
                  <Markdown>{v.content}</Markdown>
                ) : (
                  <p className="text-sm text-neutral-500">Nothing to preview yet.</p>
                )}
              </div>
            )}
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500">
              <span>Markdown: ## heading, **bold**, *italic*, `code`, - list, [link](https://…)</span>
              <span className={v.content.trim().length < MIN_CONTENT_CHARS ? "text-amber-400" : ""}>
                {v.content.length.toLocaleString()} / 50,000 · {MIN_CONTENT_CHARS} needed to submit
              </span>
            </div>
            {fieldErrors.content && <FieldError message={fieldErrors.content} />}
          </div>

          <Field
            id="blog-excerpt"
            label="Summary"
            optional
            error={fieldErrors.excerpt}
            hint="Shown on cards and in search results. Leave it empty to use the start of the post."
            aside={`${v.excerpt.length}/300`}
          >
            <textarea
              id="blog-excerpt"
              value={v.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              maxLength={300}
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>

        {/* ---- the details */}
        <aside className="min-w-0 space-y-6">
          <CategoryPicker value={v.category} onChange={(name) => set("category", name)} error={fieldErrors.category} />

          <CoverImage
            url={v.coverImageUrl}
            alt={v.coverAlt}
            onUrl={(next) => set("coverImageUrl", next)}
            onAlt={(next) => set("coverAlt", next)}
            onError={setError}
            urlError={fieldErrors.coverImageUrl}
          />

          <TagsInput tags={v.tags} onChange={(next) => set("tags", next)} error={fieldErrors.tags} />

          <section className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="text-sm font-semibold text-white">Search &amp; sharing</h2>
            <Field
              id="blog-seo-title"
              label="Search title"
              optional
              error={fieldErrors.seoTitle}
              aside={`${v.seoTitle.length}/60`}
              hint="Defaults to the post title."
            >
              <input
                id="blog-seo-title"
                value={v.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                maxLength={60}
                className={inputClass}
              />
            </Field>
            <Field
              id="blog-seo-desc"
              label="Search description"
              optional
              error={fieldErrors.seoDescription}
              aside={`${v.seoDescription.length}/160`}
              hint="Defaults to the summary."
            >
              <textarea
                id="blog-seo-desc"
                value={v.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                maxLength={160}
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </Field>
            <div className="rounded-xl border border-white/10 bg-[#0e0e11] p-3.5" aria-label="Search result preview">
              <p className="truncate font-mono text-[11px] text-neutral-500">ptsc › blogs › {slugify(v.title) || "your-post"}</p>
              <p className="mt-1 line-clamp-2 text-sm font-medium text-blue-400">{v.seoTitle || v.title || "Your post title"}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-neutral-400">
                {v.seoDescription || v.excerpt || "The start of your post shows here."}
              </p>
            </div>
          </section>

          {canEdit && !directLive && (
            <section className="space-y-2 border-t border-white/10 pt-6">
              <h2 className="text-sm font-semibold text-white">Before you submit</h2>
              {problems.length === 0 ? (
                <p className="text-xs text-emerald-400">Everything needed is there.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-4 text-xs text-amber-300 marker:text-amber-500">
                  {problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {detail && isAuthor && detail.status === "published" && detail.revision && detail.revision.state !== "pending" && (
            <button type="button" onClick={discardEdit} disabled={busy !== null} className={`${secondaryButton} w-full`}>
              Discard my edit
            </button>
          )}
        </aside>
      </fieldset>
    </div>
  );
}

// -------------------------------------------------------- the writing area ----

function ContentEditor({
  value,
  onChange,
  onError,
}: {
  value: string;
  onChange: (value: string) => void;
  onError: (message: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  /** Replaces the selected text and puts the cursor back where it makes sense. */
  const edit = (change: (selected: string, before: string, after: string) => { text: string; select?: [number, number] }) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const result = change(value.slice(start, end), value.slice(0, start), value.slice(end));
    onChange(value.slice(0, start) + result.text + value.slice(end));
    const [from, to] = result.select ?? [start + result.text.length, start + result.text.length];
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + from, start + to);
    });
  };

  const wrap = (before: string, after: string, placeholder: string) =>
    edit((selected) => {
      const inner = selected || placeholder;
      return { text: `${before}${inner}${after}`, select: [before.length, before.length + inner.length] };
    });

  /** Puts a marker at the start of each selected line. */
  const prefixLines = (marker: (index: number) => string) =>
    edit((selected, before) => {
      const lines = (selected || "Item").split("\n");
      const text = lines.map((line, i) => `${marker(i)}${line}`).join("\n");
      const needsBreak = before.length > 0 && !before.endsWith("\n");
      return { text: `${needsBreak ? "\n" : ""}${text}`, select: [(needsBreak ? 1 : 0), (needsBreak ? 1 : 0) + text.length] };
    });

  const insertLink = () =>
    edit((selected) => {
      const label = selected || "link text";
      const text = `[${label}](https://)`;
      const urlStart = label.length + 3;
      return { text, select: [urlStart, urlStart + 8] };
    });

  const insertCodeBlock = () =>
    edit((selected, before) => {
      const lead = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
      const code = selected || "code here";
      return { text: `${lead}\`\`\`\n${code}\n\`\`\`\n`, select: [lead.length + 4, lead.length + 4 + code.length] };
    });

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, BLOG_SIGN);
      edit(() => ({ text: `![Describe the image](${url})`, select: [2, 21] }));
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0e0e11] focus-within:border-white/30">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-white/10 px-2 py-1.5">
        <ToolButton label="Heading" Icon={Heading2} onClick={() => prefixLines(() => "## ")} />
        <ToolButton label="Subheading" Icon={Heading3} onClick={() => prefixLines(() => "### ")} />
        <ToolButton label="Bold" Icon={Bold} onClick={() => wrap("**", "**", "bold text")} />
        <ToolButton label="Italic" Icon={Italic} onClick={() => wrap("*", "*", "italic text")} />
        <ToolButton label="Inline code" Icon={Code} onClick={() => wrap("`", "`", "code")} />
        <ToolButton label="Code block" Icon={FileCode2} onClick={insertCodeBlock} />
        <ToolButton label="Link" Icon={Link2} onClick={insertLink} />
        <ToolButton label="Bulleted list" Icon={List} onClick={() => prefixLines(() => "- ")} />
        <ToolButton label="Numbered list" Icon={ListOrdered} onClick={() => prefixLines((i) => `${i + 1}. `)} />
        <ToolButton label="Quote" Icon={Quote} onClick={() => prefixLines(() => "> ")} />
        <span className="mx-1 h-4 w-px bg-white/10" />
        <button
          type="button"
          title="Insert image"
          aria-label="Insert image"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => pickImage(e.target.files?.[0])}
        />
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={50_000}
        spellCheck
        aria-label="Post content in Markdown"
        placeholder={"Start with the point of the post.\n\n## Use headings to break it up\n\nShow code in fenced blocks."}
        className="block min-h-[26rem] w-full resize-y bg-transparent p-4 font-mono text-[13px] leading-6 text-neutral-100 placeholder-neutral-600 focus:outline-none"
      />
    </div>
  );
}

function ToolButton({ label, Icon, onClick }: { label: string; Icon: typeof Bold; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

// ------------------------------------------------------------ side fields ----

function CategoryPicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (name: string) => void;
  error?: string;
}) {
  const { data, reload } = useApi<{ categories: BlogCategoryRow[] }>("/api/blogs/categories");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const categories = data?.categories ?? [];
  // A post can hold a category that has since been removed; keep it selectable.
  const known = categories.some((c) => c.name === value);
  const options = [
    ...categories.map((c) => ({ value: c.name, label: c.name })),
    ...(value && !known && data ? [{ value, label: value }] : []),
    { value: NEW_CATEGORY, label: "+ Add a new category…" },
  ];

  const add = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setProblem(null);
    try {
      const res = await api<{ category: BlogCategoryRow }>("/api/blogs/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      await reload();
      onChange(res.category.name);
      setName("");
      setAdding(false);
    } catch (e) {
      setProblem(detailedErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Field id="blog-category" label="Category" required error={error}>
      <Dropdown
        id="blog-category"
        value={value}
        placeholder="Choose a category"
        options={options}
        onChange={(next) => (next === NEW_CATEGORY ? setAdding(true) : onChange(next))}
      />
      {adding && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void add();
                }
              }}
              maxLength={30}
              autoFocus
              placeholder="e.g. Open Source"
              aria-label="New category name"
              className={inputClass}
            />
            <button type="button" onClick={add} disabled={saving || !name.trim()} className={`${primaryButton} shrink-0`}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setProblem(null);
              }}
              aria-label="Cancel"
              className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {problem && <FieldError message={problem} />}
        </div>
      )}
    </Field>
  );
}

function CoverImage({
  url,
  alt,
  onUrl,
  onAlt,
  onError,
  urlError,
}: {
  url: string;
  alt: string;
  onUrl: (url: string) => void;
  onAlt: (alt: string) => void;
  onError: (message: string) => void;
  urlError?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      onUrl(await uploadImage(file, BLOG_SIGN));
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <Field id="blog-cover" label="Cover image" optional error={urlError} hint="Shown at the top of the post and on cards.">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element -- a preview of whatever link was given
          <img src={url} alt="" className="mb-2 aspect-[16/9] w-full rounded-xl border border-white/10 object-cover" />
        )}
        <div className="flex items-center gap-2">
          <input
            id="blog-cover"
            type="url"
            value={url}
            onChange={(e) => onUrl(e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={`${secondaryButton} shrink-0`}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
            Upload
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </div>
      </Field>
      {url && (
        <Field
          id="blog-cover-alt"
          label="Describe the image"
          required
          hint="Read aloud by screen readers and shown if the image can't load."
          aside={`${alt.length}/150`}
        >
          <input
            id="blog-cover-alt"
            value={alt}
            onChange={(e) => onAlt(e.target.value)}
            maxLength={150}
            className={inputClass}
          />
        </Field>
      )}
    </div>
  );
}

function TagsInput({ tags, onChange, error }: { tags: string[]; onChange: (tags: string[]) => void; error?: string }) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tag = raw.trim().replace(/^#/, "").slice(0, 30);
    if (!tag || tags.length >= 8 || tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...tags, tag]);
    setDraft("");
  };

  return (
    <Field id="blog-tags" label="Tags" optional error={error} hint="Up to 8. Press Enter or comma after each.">
      {tags.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag}>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 py-1 pl-2.5 pr-1.5 text-xs text-neutral-200">
                #{tag}
                <button
                  type="button"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => onChange(tags.filter((t) => t !== tag))}
                  className="rounded-full p-0.5 text-neutral-500 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <input
        id="blog-tags"
        value={draft}
        onChange={(e) => {
          if (e.target.value.endsWith(",")) add(e.target.value.slice(0, -1));
          else setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={() => add(draft)}
        disabled={tags.length >= 8}
        maxLength={31}
        placeholder={tags.length >= 8 ? "That's the maximum" : "git, beginners"}
        className={inputClass}
      />
    </Field>
  );
}
