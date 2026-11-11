"use client";

import { Suspense, useEffect, useState } from "react";
import AdminProjectsView from "@/components/dashboard/AdminProjectsView";
import { ErrorBanner, ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { useUrlQuery } from "@/components/dashboard/useUrlQuery";
import { useDebouncedSearch } from "@/components/dashboard/useDebouncedSearch";
import { useAdminDashboard } from "@/context/AdminDashboardContext";
import { api, detailedErrorMessage, errorMessage } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import type { AdminProject, PageInfo, ProjectInput } from "@/lib/types/admin";

interface ProjectsResponse extends PageInfo {
  projects: AdminProject[];
}

function ProjectsRoute() {
  const { role } = useAdminDashboard();
  const { params, page, setQuery } = useUrlQuery();
  const q = params.get("q") ?? "";
  const [search, setSearch] = useDebouncedSearch(q, (value) => setQuery({ q: value, page: null }));

  const query = new URLSearchParams({ page: String(page) });
  if (q) query.set("q", q);
  const { data, error, loading, refreshing, reload } = useApi<ProjectsResponse>(
    `/api/admin/projects?${query}`
  );
  const [actionError, setActionError] = useState<string | null>(null);

  // The server clamps a page past the end; keep the URL in step.
  useEffect(() => {
    if (data && data.page !== page) setQuery({ page: data.page });
  }, [data, page, setQuery]);

  const handleSave = async (input: ProjectInput, id?: string) => {
    try {
      await api(id ? `/api/admin/projects/${id}` : "/api/admin/projects", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(input),
      });
      // Featured projects sort first, so ask again rather than patch the list in place.
      await reload();
      return null;
    } catch (e) {
      return detailedErrorMessage(e);
    }
  };

  const handleDelete = async (id: string) => {
    const project = data?.projects.find((p) => p.id === id);
    if (!window.confirm(`Delete "${project?.title ?? "this project"}"? This can't be undone.`)) return;
    setActionError(null);
    try {
      await api(`/api/admin/projects/${id}`, { method: "DELETE" });
      await reload();
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  if (error && !data) return <ErrorBlock title="Couldn't load projects" message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingBlock label="Loading projects…" />;

  return (
    <div className="space-y-4">
      {actionError && <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />}
      <AdminProjectsView
        projects={data.projects}
        search={search}
        onSearchChange={setSearch}
        pageInfo={data}
        onPageChange={(next) => setQuery({ page: next })}
        loading={refreshing}
        canDelete={role === "admin"}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}

// useSearchParams needs a Suspense boundary above it.
export default function ProjectsPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading projects…" />}>
      <ProjectsRoute />
    </Suspense>
  );
}
