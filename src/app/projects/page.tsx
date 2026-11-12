import ProjectsView, { projectsMetadata } from "./ProjectsView";

// Page 1 of every project. Reads nothing from the request, so it is built ahead of time
// and served from the CDN; ?page and ?tag are other routes (see ProjectsView.tsx).
export const metadata = projectsMetadata;

export default function ProjectsPage() {
  return <ProjectsView />;
}
