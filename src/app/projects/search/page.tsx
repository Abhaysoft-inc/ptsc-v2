import { Suspense } from "react";
import ProjectsView, { projectsMetadata } from "../ProjectsView";
import { pageNumber } from "@/lib/paging";

// /projects?tag=… arrives here through a rewrite in next.config.ts. Technologies are
// free text, so these are rendered on request (the data itself is cached).

export const metadata = { ...projectsMetadata, robots: { index: false, follow: true } };

type Props = { searchParams: Promise<{ page?: string; tag?: string }> };

async function Results({ searchParams }: Props) {
  const { page, tag } = await searchParams;
  return <ProjectsView page={pageNumber(page) ?? 1} tag={tag ?? ""} />;
}

export default function ProjectsSearchPage({ searchParams }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080809]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      }
    >
      <Results searchParams={searchParams} />
    </Suspense>
  );
}
