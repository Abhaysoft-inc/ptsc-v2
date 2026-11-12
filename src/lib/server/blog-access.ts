import "server-only";
import type { NextResponse } from "next/server";
import { isObjectId, notFound } from "@/lib/server/query";
import { authorIdOf, loadBlog, type BlogRecord } from "@/lib/server/blogs";
import { isReviewer } from "@/lib/blog-rules";
import type { SessionUser } from "@/lib/auth/types";

/**
 * Loads a post for someone who may only see it if they wrote it or are a reviewer.
 * Anyone else gets a plain "not found", so a draft's existence isn't revealed.
 * The caller must already have connected to the database.
 */
export async function loadForUser(
  id: string,
  user: SessionUser
): Promise<{ blog: BlogRecord; mine: boolean } | { response: NextResponse }> {
  if (!isObjectId(id)) return { response: notFound("Post not found.") };
  const blog = await loadBlog(id);
  if (!blog) return { response: notFound("Post not found.") };

  const mine = authorIdOf(blog) === user.id;
  if (!mine && !isReviewer(user.role)) return { response: notFound("Post not found.") };
  return { blog, mine };
}
