// The blog's lifecycle rules as plain functions: who can do what to a post in a
// given state. The API routes use these, and they're tested on their own.
import type { BlogFields, BlogStatus, RevisionState } from "@/lib/types/blog";

export const MIN_CONTENT_CHARS = 300;

/** What is missing before a post can be sent for review. Empty means it's ready. */
export function submitProblems(fields: BlogFields): string[] {
  const problems: string[] = [];
  if (fields.title.trim().length < 5) problems.push("Add a title of at least 5 characters.");
  if (fields.content.trim().length < MIN_CONTENT_CHARS) {
    problems.push(`Write at least ${MIN_CONTENT_CHARS} characters before submitting.`);
  }
  if (!fields.category.trim()) problems.push("Choose a category.");
  if (fields.coverImageUrl.trim() && !fields.coverAlt.trim()) {
    problems.push("Describe the cover image in the alt text.");
  }
  return problems;
}

type State = { status: BlogStatus; revision: RevisionState | null };

/**
 * Where an author's edit goes:
 *  - "post": the post's own fields (a draft, or a rejected post being fixed)
 *  - "revision": a published post's edit, so the live version is never touched
 * or an error message when the post can't be edited right now.
 */
export function authorEditTarget(s: State): { target: "post" | "revision" } | { error: string } {
  if (s.status === "pending") {
    return { error: "This post is waiting for review. Withdraw it first to edit it." };
  }
  if (s.status === "published") {
    if (s.revision === "pending") {
      return { error: "Your edit is waiting for review. Withdraw it first to change it." };
    }
    return { target: "revision" };
  }
  return { target: "post" };
}

/** What "Submit for review" sends: the post itself, or the revision of a published post. null = can't. */
export function submitTarget(s: State): "post" | "revision" | null {
  if (s.status === "draft" || s.status === "rejected") return "post";
  if (s.status === "published" && (s.revision === "draft" || s.revision === "rejected")) {
    return "revision";
  }
  return null;
}

/** What "Withdraw" takes back. */
export function withdrawTarget(s: State): "post" | "revision" | null {
  if (s.status === "pending") return "post";
  if (s.status === "published" && s.revision === "pending") return "revision";
  return null;
}

/** What a reviewer's approve or reject applies to. null = nothing is waiting. */
export function reviewTarget(s: State): "post" | "revision" | null {
  if (s.status === "pending") return "post";
  if (s.status === "published" && s.revision === "pending") return "revision";
  return null;
}

/** An author can delete only work that was never public. */
export const authorCanDelete = (status: BlogStatus) => status === "draft" || status === "rejected";

/** Admins and members review. Everyone else only writes. */
export const isReviewer = (role: string) => role === "admin" || role === "member";
