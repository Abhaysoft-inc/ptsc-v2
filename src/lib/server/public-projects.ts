import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "@/lib/db";
import type { AdminProject } from "@/lib/types/admin";
import { Project } from "@/models/Project";
import { PROJECTS_TAG, toAdminProject } from "@/lib/server/projects";

export interface PublicProjectPage {
  projects: AdminProject[];
  page: number;
  totalPages: number;
  total: number;
  /** Technologies used by at least one project, most common first. */
  tags: { label: string; count: number }[];
}

const EMPTY: PublicProjectPage = { projects: [], page: 1, totalPages: 1, total: 0, tags: [] };

/**
 * One page of projects for the website: featured first, then newest. `tag` shows
 * only projects using that technology (ignoring case). The filter chips come back
 * with it. Cached, and refreshed when staff change a project.
 */
export async function getPublicProjects(
  page = 1,
  tag = "",
  pageSize = 9
): Promise<PublicProjectPage> {
  "use cache";
  cacheTag(PROJECTS_TAG);
  cacheLife("minutes");

  await connectDB();
  const filter = tag ? { tags: tag } : {};
  // "react" matches "React" and "REACT".
  const collation = { locale: "en", strength: 2 } as const;
  const wanted = Math.max(1, page);

  const fetchPage = (skip: number) =>
    Project.find(filter)
      .collation(collation)
      .sort({ featured: -1, createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

  // The total, the technology list and the page itself are asked for together.
  const [total, tagRows, firstTry] = await Promise.all([
    Project.countDocuments(filter).collation(collation),
    Project.aggregate<{ _id: string; label: string; n: number }>([
      { $unwind: "$tags" },
      { $group: { _id: { $toLower: "$tags" }, label: { $first: "$tags" }, n: { $sum: 1 } } },
      { $sort: { n: -1, _id: 1 } },
      { $limit: 40 },
    ]),
    fetchPage((wanted - 1) * pageSize),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(wanted, totalPages);
  const rows = current === wanted ? firstTry : await fetchPage((current - 1) * pageSize);

  return {
    projects: rows.map(toAdminProject),
    page: current,
    totalPages,
    total,
    tags: tagRows.map((t) => ({ label: t.label, count: t.n })),
  };
}

/** Like getPublicProjects, but a database failure gives an empty page instead of an error page. */
export async function getPublicProjectsSafe(page = 1, tag = ""): Promise<PublicProjectPage> {
  try {
    return await getPublicProjects(page, tag);
  } catch (error) {
    console.error("Loading projects failed:", error);
    return EMPTY;
  }
}
