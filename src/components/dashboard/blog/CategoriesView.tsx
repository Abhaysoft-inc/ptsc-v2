"use client";

import { useState } from "react";
import { Plus, Tags, Trash2 } from "lucide-react";
import { ErrorBanner, ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { useAdminDashboard } from "@/context/AdminDashboardContext";
import { api, detailedErrorMessage, errorMessage } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import type { BlogCategoryRow } from "@/lib/types/blog";
import { dangerButton, primaryButton } from "./blog-ui";

/** The blog's categories. Anyone can add one; reviewers can delete ones nothing uses. */
export default function CategoriesView() {
  const { currentUser } = useAdminDashboard();
  const canDelete = currentUser.role === "admin" || currentUser.role === "member";
  const { data, error, loading, reload } = useApi<{ categories: BlogCategoryRow[] }>("/api/blogs/categories");

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setActionError(null);
    try {
      await api("/api/blogs/categories", { method: "POST", body: JSON.stringify({ name }) });
      setName("");
      await reload();
    } catch (err) {
      setActionError(detailedErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category: BlogCategoryRow) => {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    setActionError(null);
    try {
      await api(`/api/blogs/categories/${category.id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  };

  if (error && !data) return <ErrorBlock title="Couldn't load categories" message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingBlock label="Loading categories…" />;

  return (
    <div className="max-w-2xl space-y-5">
      {actionError && <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />}

      <form onSubmit={add} className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          placeholder="New category, e.g. Open Source"
          aria-label="New category name"
          className="w-full rounded-xl border border-white/10 bg-[#121215] px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none"
        />
        <button type="submit" disabled={saving || !name.trim()} className={`${primaryButton} shrink-0`}>
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          Add
        </button>
      </form>

      <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
        {data.categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <Tags className="h-4 w-4 text-neutral-600" />
              <span className="text-sm font-medium text-white">{c.name}</span>
              <span className="font-mono text-[11px] text-neutral-500">
                {c.posts} {c.posts === 1 ? "post" : "posts"}
              </span>
            </div>
            {canDelete && c.key !== "other" && c.posts === 0 && (
              <button type="button" onClick={() => remove(c)} aria-label={`Delete ${c.name}`} className={dangerButton}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
