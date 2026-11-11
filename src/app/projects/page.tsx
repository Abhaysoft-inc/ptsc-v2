import SitePage, { PageHeader, Section } from "@/components/site/SitePage";
import { getPublicProjectsSafe } from "@/lib/server/public-projects";
import ProjectsClient from "./ProjectsClient";

export const metadata = {
  title: "Projects | PTSC Club",
  description: "Things the members of the Programming and Tech Skills Club have built.",
};

export default async function ProjectsPage() {
  const projects = await getPublicProjectsSafe();

  return (
    <SitePage>
      <PageHeader
        path="projects"
        title="Built by our members."
        lead="Websites, apps and experiments made by students in the club. Some are finished, some are still in progress."
      />
      <Section>
        <ProjectsClient projects={projects} />
      </Section>
    </SitePage>
  );
}
