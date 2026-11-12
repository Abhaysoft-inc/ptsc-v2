import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectsView, { projectsMetadata } from "../../ProjectsView";
import { getPublicProjects } from "@/lib/server/public-projects";
import { pageNumber } from "@/lib/paging";

// /projects?page=N arrives here through a rewrite in next.config.ts. The pages that
// exist at build time are built ahead of time; later ones on their first visit.
export const instant = false;

type Props = { params: Promise<{ page: string }> };

export async function generateStaticParams() {
  try {
    const { totalPages } = await getPublicProjects(1, "");
    return Array.from({ length: Math.min(totalPages, 20) }, (_, i) => ({ page: String(i + 1) }));
  } catch (error) {
    // No database during the build: these get built on their first visit instead.
    console.error("Projects list: couldn't read the pages to prebuild:", error);
    return [{ page: "1" }];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = pageNumber((await params).page) ?? 1;
  return { ...projectsMetadata, alternates: { canonical: n > 1 ? `/projects?page=${n}` : "/projects" } };
}

export default async function ProjectsListPage({ params }: Props) {
  const n = pageNumber((await params).page);
  // A page past the end is missing, not a copy of the last page.
  if (!n || n > (await getPublicProjects(1, "")).totalPages) notFound();
  return <ProjectsView page={n} />;
}
