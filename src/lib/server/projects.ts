import "server-only";
import { z } from "zod";
import type { Types } from "mongoose";
import type { AdminProject, ProjectInput } from "@/lib/types/admin";
import { PROJECT_STATUSES, type ProjectDoc } from "@/models/Project";
import { optionalUrl, text } from "@/lib/server/events";

/** Cache tag for the public Projects page. Expire it when a project changes. */
export const PROJECTS_TAG = "projects";

type ProjectRecord = ProjectDoc & { _id: Types.ObjectId };

export const projectInputSchema = z.object({
  title: text(100).min(1, "Project title is required."),
  summary: text(500).min(1, "Add a short description."),
  tags: z
    .array(text(30))
    .max(8, "Use at most 8 tags.")
    // Drop blanks and repeats (ignoring case), keeping the first spelling.
    .transform((tags) => {
      const seen = new Set<string>();
      return tags.filter((t) => {
        const key = t.toLowerCase();
        if (!t || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }),
  status: z.enum(PROJECT_STATUSES),
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  imageUrl: optionalUrl,
  builtBy: text(150).default(""),
  featured: z.boolean().default(false),
}) satisfies z.ZodType<ProjectInput, unknown>;

/** Form input → the fields stored on a Project document. */
export function inputToDoc(input: z.output<typeof projectInputSchema>) {
  return {
    title: input.title,
    summary: input.summary,
    tags: input.tags,
    status: input.status,
    githubUrl: input.githubUrl || undefined,
    liveUrl: input.liveUrl || undefined,
    imageUrl: input.imageUrl || undefined,
    builtBy: input.builtBy,
    featured: input.featured,
  };
}

export function toAdminProject(p: ProjectRecord & { createdAt?: Date }): AdminProject {
  return {
    id: p._id.toString(),
    title: p.title,
    summary: p.summary,
    tags: p.tags ?? [],
    status: p.status === "completed" ? "completed" : "in-progress",
    githubUrl: p.githubUrl || undefined,
    liveUrl: p.liveUrl || undefined,
    imageUrl: p.imageUrl || undefined,
    builtBy: p.builtBy ?? "",
    featured: Boolean(p.featured),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
  };
}
