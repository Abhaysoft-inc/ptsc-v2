"use client";

import { useEffect, useState } from "react";
import AdminProjectsView from "@/components/dashboard/AdminProjectsView";
import { ErrorBanner, ErrorBlock, LoadingBlock } from "@/components/dashboard/ListStates";
import { useAdminDashboard } from "@/context/AdminDashboardContext";
import { api, detailedErrorMessage, errorMessage } from "@/lib/api-client";
import type { AdminProject, ProjectInput } from "@/lib/types/admin";

export default function ProjectsPage() {
  const { role } = useAdminDashboard();
  const [projects, setProjects] = useState<AdminProject[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api<{ projects: AdminProject[] }>("/api/admin/projects")
      .then((data) => !cancelled && setProjects(data.projects))
      .catch((e) => !cancelled && setLoadError(errorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setLoadError(null);
    setReloadKey((k) => k + 1);
  };

  const handleSave = async (input: ProjectInput, id?: string) => {
    try {
      await api(id ? `/api/admin/projects/${id}` : "/api/admin/projects", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify(input),
      });
      // Featured projects sort first, so reload the list rather than patch it in place.
      setReloadKey((k) => k + 1);
      return null;
    } catch (e) {
      return detailedErrorMessage(e);
    }
  };

  const handleDelete = async (id: string) => {
    const project = projects?.find((p) => p.id === id);
    if (!window.confirm(`Delete "${project?.title ?? "this project"}"? This can't be undone.`)) return;
    setActionError(null);
    try {
      await api(`/api/admin/projects/${id}`, { method: "DELETE" });
      setProjects((prev) => prev?.filter((p) => p.id !== id) ?? prev);
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  if (loadError) return <ErrorBlock title="Couldn't load projects" message={loadError} onRetry={retry} />;
  if (!projects) return <LoadingBlock label="Loading projects…" />;

  return (
    <div className="space-y-4">
      {actionError && <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />}
      <AdminProjectsView
        projects={projects}
        canDelete={role === "admin"}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
