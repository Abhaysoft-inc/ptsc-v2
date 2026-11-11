"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ExternalLink,
  FolderGit2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { MAX_IMAGE_MB, uploadImage } from "@/lib/upload-client";
import type { AdminProject, PageInfo, ProjectInput, ProjectStatus } from "@/lib/types/admin";
import Pagination from "@/components/dashboard/Pagination";
import { CheckRow, Field, describe, inputClass } from "@/components/dashboard/event-form/FormParts";
import { isLink } from "@/components/dashboard/event-form/formModel";
import { EmptyBlock } from "@/components/dashboard/ListStates";
import StaggerList from "@/components/motion/StaggerList";
import Dropdown from "@/components/ui/dropdown";

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  "in-progress": "In progress",
  completed: "Completed",
};

interface AdminProjectsViewProps {
  /** One page of projects. Search and paging are done by the server. */
  projects: AdminProject[];
  search: string;
  onSearchChange: (value: string) => void;
  pageInfo: PageInfo;
  onPageChange: (page: number) => void;
  /** A newer answer is on its way (the current page stays visible meanwhile). */
  loading: boolean;
  /** Only admins can delete. */
  canDelete: boolean;
  /** Saves a new project, or the edited one when `id` is given. Resolves to an error message, or null on success. */
  onSave: (input: ProjectInput, id?: string) => Promise<string | null>;
  onDelete: (id: string) => void;
}

// ------------------------------------------------------------------ form ----

function ProjectForm({
  project,
  onSave,
  onClose,
}: {
  project: AdminProject | null;
  onSave: AdminProjectsViewProps["onSave"];
  onClose: () => void;
}) {
  const editing = project !== null;
  const [title, setTitle] = useState(project?.title ?? "");
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "in-progress");
  const [tagText, setTagText] = useState((project?.tags ?? []).join(", "));
  const [builtBy, setBuiltBy] = useState(project?.builtBy ?? "");
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const tags = tagText.split(",").map((t) => t.trim()).filter(Boolean);

  const errors = {
    title: title.trim() ? undefined : "Project title is required.",
    summary: summary.trim() ? undefined : "Add a short description.",
    tags: tags.length > 8 ? "Use at most 8 tags." : undefined,
    githubUrl:
      githubUrl.trim() && !isLink(githubUrl) ? "Enter a full link starting with http:// or https://" : undefined,
    liveUrl:
      liveUrl.trim() && !isLink(liveUrl) ? "Enter a full link starting with http:// or https://" : undefined,
    imageUrl:
      imageUrl.trim() && !isLink(imageUrl) ? "Enter a full link starting with http:// or https://" : undefined,
  };
  const shown = (key: keyof typeof errors) => (showErrors ? errors[key] : undefined);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      setImageUrl(await uploadImage(file));
    } catch (error) {
      setUploadError(errorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (Object.values(errors).some(Boolean)) {
      setShowErrors(true);
      return;
    }
    setFormError(null);
    setSaving(true);
    const failure = await onSave(
      {
        title: title.trim(),
        summary: summary.trim(),
        tags,
        status,
        githubUrl: githubUrl.trim() || undefined,
        liveUrl: liveUrl.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        builtBy: builtBy.trim(),
        featured,
      },
      project?.id
    );
    if (failure) {
      setFormError(failure);
      setSaving(false);
      return;
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={editing ? "Edit project" : "Add project"}
      onClick={() => !saving && onClose()}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md sm:items-center"
    >
      <form
        noValidate
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl space-y-5 rounded-3xl border border-white/15 bg-[#111113] p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close form"
          className="absolute right-5 top-5 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            {editing ? "Edit project" : "Add a project"}
          </h3>
          <p className="mt-1 text-xs text-neutral-400">
            This appears on the public Projects page as soon as you save.
          </p>
        </div>

        <Field id="pj-title" label="Title" required error={shown("title")}>
          <input
            {...describe("pj-title", { error: shown("title") })}
            type="text"
            autoFocus
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Campus Marketplace"
            className={inputClass}
          />
        </Field>

        <Field
          id="pj-summary"
          label="Description"
          required
          error={shown("summary")}
          aside={`${summary.length} / 500`}
          hint="One or two sentences on what it does."
        >
          <textarea
            {...describe("pj-summary", { hint: true, error: shown("summary") })}
            rows={3}
            maxLength={500}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="pj-status" label="Status">
            <Dropdown
              id="pj-status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "in-progress", label: "In progress" },
                { value: "completed", label: "Completed" },
              ]}
            />
          </Field>

          <Field id="pj-builtBy" label="Built by" optional>
            <input
              id="pj-builtBy"
              type="text"
              maxLength={150}
              value={builtBy}
              onChange={(e) => setBuiltBy(e.target.value)}
              placeholder="e.g. Anshuman and Diya"
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          id="pj-tags"
          label="Technologies"
          optional
          error={shown("tags")}
          hint="Separate with commas, up to 8."
        >
          <input
            {...describe("pj-tags", { hint: true, error: shown("tags") })}
            type="text"
            value={tagText}
            onChange={(e) => setTagText(e.target.value)}
            placeholder="Next.js, MongoDB, Tailwind"
            className={inputClass}
          />
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-neutral-300"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="pj-github" label="GitHub link" optional error={shown("githubUrl")}>
            <input
              {...describe("pj-github", { error: shown("githubUrl") })}
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/…"
              className={inputClass}
            />
          </Field>
          <Field id="pj-live" label="Live link" optional error={shown("liveUrl")}>
            <input
              {...describe("pj-live", { error: shown("liveUrl") })}
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          id="pj-image"
          label="Cover image"
          optional
          error={shown("imageUrl") ?? uploadError ?? undefined}
          hint={`Upload one (JPG, PNG, WebP or GIF, up to ${MAX_IMAGE_MB} MB) or paste a link.`}
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              {...describe("pj-image", {
                hint: true,
                error: shown("imageUrl") ?? uploadError ?? undefined,
              })}
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://… image link"
              className={`${inputClass} sm:flex-1`}
            />
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFile}
              className="sr-only"
              tabIndex={-1}
              aria-label="Choose a cover image to upload"
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{uploading ? "Uploading…" : "Upload"}</span>
            </button>
          </div>
        </Field>

        <CheckRow
          checked={featured}
          onChange={setFeatured}
          title="Feature this project"
          description="Featured projects are listed first on the Projects page."
        />

        {formError && (
          <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            {formError}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-md transition-colors hover:bg-neutral-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{saving ? "Saving…" : editing ? "Save changes" : "Add project"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// ------------------------------------------------------------------ list ----

function Thumb({ project }: { project: AdminProject }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#18181b]">
      {project.imageUrl && !failed ? (
        <Image
          src={project.imageUrl}
          alt=""
          fill
          unoptimized
          sizes="96px"
          onError={() => setFailed(true)}
          className="object-cover"
        />
      ) : (
        <FolderGit2 className="h-5 w-5 text-neutral-600" />
      )}
    </div>
  );
}

export default function AdminProjectsView({
  projects,
  search,
  onSearchChange,
  pageInfo,
  onPageChange,
  loading,
  canDelete,
  onSave,
  onDelete,
}: AdminProjectsViewProps) {
  // null = closed, "new" = adding, a project = editing it
  const [editing, setEditing] = useState<AdminProject | "new" | null>(null);

  return (
    <StaggerList className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects by title, description or technology..."
            aria-label="Search projects"
            className="w-full pl-10 pr-4 py-2 bg-[#121215] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
          />
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-black shadow-md transition-all hover:bg-neutral-200 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Add project</span>
        </button>
      </div>

      {projects.length === 0 && !loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#111113]">
          <EmptyBlock
            icon={FolderGit2}
            title={search ? "No projects match" : "No projects yet"}
            hint={
              search
                ? "Try a different search."
                : "Add the first one and it will appear on the public Projects page."
            }
          />
        </div>
      ) : (
        <ul
          aria-busy={loading}
          className={`divide-y divide-white/6 border-y border-white/8 transition-opacity ${
            loading ? "opacity-60" : ""
          }`}
        >
          {projects.map((p) => (
            <li key={p.id} className="flex items-center gap-4 py-4">
              <Thumb project={p} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-white">{p.title}</h3>
                  {p.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                      <Star className="h-3 w-3" /> Featured
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${
                      p.status === "completed"
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-blue-400/10 text-blue-300"
                    }`}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-neutral-400">{p.summary}</p>
                {p.tags.length > 0 && (
                  <p className="mt-1 truncate font-mono text-[11px] text-neutral-500">
                    {p.tags.join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {(p.liveUrl || p.githubUrl) && (
                  <a
                    href={p.liveUrl || p.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${p.title}`}
                    className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  aria-label={`Edit ${p.title}`}
                  className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(p.id)}
                    aria-label={`Delete ${p.title}`}
                    className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination info={pageInfo} onPageChange={onPageChange} loading={loading} noun={["project", "projects"]} />

      {editing && (
        <ProjectForm
          project={editing === "new" ? null : editing}
          onSave={onSave}
          onClose={() => setEditing(null)}
        />
      )}
    </StaggerList>
  );
}
