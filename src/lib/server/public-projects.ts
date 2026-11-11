import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/lib/db";
import type { AdminProject } from "@/lib/types/admin";
import { Project } from "@/models/Project";
import { PROJECTS_TAG, toAdminProject } from "@/lib/server/projects";

/** Projects for the website: featured first, then newest. Cached, and refreshed when staff change one. */
export async function getPublicProjects(): Promise<AdminProject[]> {
  "use cache";
  cacheTag(PROJECTS_TAG);
  cacheLife("minutes");

  await connectDB();
  const docs = await Project.find({}).sort({ featured: -1, createdAt: -1 }).lean();
  return docs.map(toAdminProject);
}

/** Like getPublicProjects, but a database failure gives an empty list instead of an error page. */
export async function getPublicProjectsSafe(): Promise<AdminProject[]> {
  try {
    return await getPublicProjects();
  } catch (error) {
    console.error("Loading projects failed:", error);
    return [];
  }
}
