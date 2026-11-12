import SitePage, { PageHeader, Section } from "@/components/site/SitePage";
import { getPublicProjectsSafe } from "@/lib/server/public-projects";
import ProjectsClient from "./ProjectsClient";

export const projectsMetadata = {
  title: "Projects | PTSC Club",
  description: "Things the members of the Programming and Tech Skills Club have built.",
};

/**
 * The projects list. The address people see is /projects with optional ?page and ?tag;
 * next.config.ts rewrites it (at the CDN, no server function) to the route that serves it:
 *   /projects              page 1, every technology: built ahead of time
 *   /projects/list/[page]  ?page=N: built ahead of time
 *   /projects/search       ?tag=…: rendered on request (technologies are free text)
 */
export default async function ProjectsView({ page = 1, tag = "" }: { page?: number; tag?: string }) {
  const cleanTag = tag.trim().slice(0, 40);
  const data = await getPublicProjectsSafe(page, cleanTag);
  return (
    <SitePage>
      <PageHeader
        path="projects"
        title="Built by our members."
        lead="Websites, apps and experiments made by students in the club. Some are finished, some are still in progress."
      />
      <Section>
        <ProjectsClient {...data} activeTag={cleanTag.toLowerCase()} />
      </Section>
    </SitePage>
  );
}
