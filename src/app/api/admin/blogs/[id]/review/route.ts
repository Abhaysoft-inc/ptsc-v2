import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import { badRequest, isObjectId, notFound, parseBody } from "@/lib/server/query";
import { expireBlogs, loadBlog, toBlogDetail, uniqueBlogSlug } from "@/lib/server/blogs";
import { reviewTarget } from "@/lib/blog-rules";
import { Blog } from "@/models/Blog";

type Context = { params: Promise<{ id: string }> };

const reviewSchema = z.object({
  action: z.enum(["approve", "reject", "unpublish"]),
  note: z.string().trim().max(500, "Keep the note under 500 characters.").optional(),
});

// The fields a revision replaces on the live post when it is approved.
const REVISION_FIELDS = [
  "title",
  "excerpt",
  "content",
  "category",
  "categoryKey",
  "tags",
  "coverImageUrl",
  "coverAlt",
  "seoTitle",
  "seoDescription",
  "readMinutes",
] as const;

// POST /api/admin/blogs/:id/review { action, note? }
//   approve    publishes a pending new post, or replaces the live post with its pending edit
//   reject     sends it back to the author with a note (required); the live post is untouched
//   unpublish  takes a published post off the site and back to draft
// Reviewers are admins and members.
export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Post not found.");

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    const body = await parseBody(request, reviewSchema, "Invalid request.");
    if ("response" in body) return body.response;
    const { action, note = "" } = body.data;

    await connectDB();
    const blog = await loadBlog(id);
    if (!blog) return notFound("Post not found.");

    const now = new Date();
    const reviewed = { reviewedBy: auth.user.id, reviewedAt: now };

    if (action === "unpublish") {
      if (blog.status !== "published") {
        return NextResponse.json(
          { success: false, message: "Only a published post can be unpublished." },
          { status: 409 }
        );
      }
      // Back to draft. Any edit in progress is dropped so the author starts from one version.
      await Blog.updateOne(
        { _id: id },
        { $set: { status: "draft", featured: false, ...reviewed }, $unset: { revision: "" } }
      );
      expireBlogs();
    } else {
      const target = reviewTarget({
        status: blog.status as "draft",
        revision: (blog.revision?.state as "draft" | undefined) ?? null,
      });
      if (!target) {
        return NextResponse.json(
          { success: false, message: "Nothing is waiting for review on this post." },
          { status: 409 }
        );
      }

      if (action === "reject") {
        if (note.length < 3) return badRequest("Tell the author what to change.", { note: "A note is required." });
        await Blog.updateOne(
          { _id: id },
          target === "post"
            ? { $set: { status: "rejected", reviewNote: note, ...reviewed } }
            : { $set: { "revision.state": "rejected", "revision.reviewNote": note, ...reviewed } }
        );
      } else if (target === "post") {
        // A new post goes live. The slug is made now and never changes afterwards.
        const slug = blog.slug ?? (await uniqueBlogSlug(blog.title, id));
        await Blog.updateOne(
          { _id: id },
          {
            $set: {
              status: "published",
              slug,
              publishedAt: blog.publishedAt ?? now,
              publishedUpdatedAt: now,
              reviewNote: "",
              ...reviewed,
            },
          }
        );
        expireBlogs();
      } else {
        // An edit goes live: its fields replace the live ones, and the revision is cleared.
        const revision = blog.revision as unknown as Record<string, unknown>;
        const replacement = Object.fromEntries(REVISION_FIELDS.map((f) => [f, revision[f]]));
        await Blog.updateOne(
          { _id: id },
          { $set: { ...replacement, publishedUpdatedAt: now, ...reviewed }, $unset: { revision: "" } }
        );
        expireBlogs();
      }
    }

    const saved = await loadBlog(id);
    return NextResponse.json({ success: true, message: "Done.", blog: toBlogDetail(saved!) });
  } catch (error) {
    return serverError("Reviewing the post failed", error);
  }
}
