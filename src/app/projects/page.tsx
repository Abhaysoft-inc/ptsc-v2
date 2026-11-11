import { Suspense } from "react";
import SitePage, { PageHeader, Section } from "@/components/site/SitePage";
import { getPublicProjectsSafe } from "@/lib/server/public-projects";
import ProjectsClient from "./ProjectsClient";

export const metadata = {
  title: "Projects | PTSC Club",
  description: "Things the members of the Programming and Tech Skills Club have built.",
};

async function ProjectsContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const { page, tag } = await searchParams;
  const requested = Number(page);
  const data = await getPublicProjectsSafe(
    Number.isInteger(requested) && requested > 0 ? requested : 1,
    (tag ?? "").trim().slice(0, 40)
  );
  return <ProjectsClient {...data} activeTag={(tag ?? "").trim().toLowerCase()} />;
}

export default function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  return (
    <SitePage>
      <PageHeader
        path="projects"
        title="Built by our members."
        lead="Websites, apps and experiments made by students in the club. Some are finished, some are still in progress."
      />
      <Section>
        {/* The page and technology come from the address, which is read at request time. */}
        <Suspense fallback={<p className="py-16 text-center text-sm text-neutral-500">Loading projects…</p>}>
          <ProjectsContent searchParams={searchParams} />
        </Suspense>
      </Section>
    </SitePage>
  );
}
