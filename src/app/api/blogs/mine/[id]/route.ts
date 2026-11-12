import { NextResponse, connection } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole, serverError } from "@/lib/auth/require-admin";
import { badRequest, noStore, parseBody } from "@/lib/server/query";
import { loadForUser } from "@/lib/server/blog-access";
import {
  blogInputSchema,
  ensureCategories,
  expireBlogs,
  findCategory,
  loadBlog,
  storedFields,
  toBlogDetail,
} from "@/lib/server/blogs";
import { authorCanDelete, authorEditTarget, isReviewer } from "@/lib/blog-rules";
import { Blog } from "@/models/Blog";

type Context = { params: Promise<{ id: string }> };
const ANYONE = ["admin", "member", "normal"] as const;

// GET /api/blogs/mine/:id — one post in full, for the editor. Authors see their
// own; reviewers can open anyone's.
export async function GET(_request: Request, { params }: Context) {
  await connection();
  const { id } = await params;

  try {
    const auth = await requireRole([...ANYONE]);
    if ("response" in auth) return auth.response;

    await connectDB();
    const found = await loadForUser(id, auth.user);
    if ("response" in found) return found.response;

    return NextResponse.json({ success: true, blog: toBlogDetail(found.blog) }, noStore);
  } catch (error) {
    return serverError("Reading the post failed", error);
  }
}

// PATCH /api/blogs/mine/:id — save an edit.
//   - Author, new post or rejected post: the post itself is updated.
//   - Author, published post: the edit is saved as a REVISION. The live post is
//     not touched until a reviewer approves it.
//   - Reviewer, published post: the live post is updated directly.
export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;

  try {
    const auth = await requireRole([...ANYONE]);
    if ("response" in auth) return auth.response;

    const body = await parseBody(request, blogInputSchema, "Please fix the highlighted fields.");
    if ("response" in body) return body.response;

    await connectDB();
    const found = await loadForUser(id, auth.user);
    if ("response" in found) return found.response;
    const { blog, mine } = found;

    await ensureCategories();
    const category = await findCategory(body.data.category);
    if (!category) {
      return badRequest("That category doesn't exist. Pick one from the list, or add it.", {
        category: "Pick a category from the list.",
      });
    }
    const fields = storedFields(body.data, category);

    if (blog.status === "published" && isReviewer(auth.user.role)) {
      // A reviewer's change to a live post is applied straight away.
      await Blog.updateOne({ _id: id }, { $set: { ...fields, publishedUpdatedAt: new Date() } });
      expireBlogs();
    } else if (!mine) {
      return NextResponse.json(
        { success: false, message: "Only the author can edit this post until it is published." },
        { status: 403 }
      );
    } else {
      const where = authorEditTarget({
        status: blog.status as "draft",
        revision: (blog.revision?.state as "draft" | undefined) ?? null,
      });
      if ("error" in where) {
        return NextResponse.json({ success: false, message: where.error }, { status: 409 });
      }
      if (where.target === "post") {
        await Blog.updateOne({ _id: id }, { $set: fields });
      } else {
        // The live fields stay exactly as they are.
        await Blog.updateOne(
          { _id: id },
          { $set: { revision: { ...fields, state: "draft", reviewNote: "" } } }
        );
      }
    }

    const saved = await loadBlog(id);
    return NextResponse.json({ success: true, message: "Saved.", blog: toBlogDetail(saved!) });
  } catch (error) {
    return serverError("Saving the post failed", error);
  }
}

// DELETE /api/blogs/mine/:id — authors can delete drafts and rejected posts
// (never published work). Admins can delete any post.
export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;

  try {
    const auth = await requireRole([...ANYONE]);
    if ("response" in auth) return auth.response;

    await connectDB();
    const found = await loadForUser(id, auth.user);
    if ("response" in found) return found.response;
    const { blog, mine } = found;

    const isAdmin = auth.user.role === "admin";
    if (!isAdmin) {
      if (!mine) {
        return NextResponse.json(
          { success: false, message: "Only an admin can delete someone else's post." },
          { status: 403 }
        );
      }
      if (!authorCanDelete(blog.status as "draft")) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This post is in review or published, so it can't be deleted. Withdraw it first, or ask an admin.",
          },
          { status: 409 }
        );
      }
    }

    await Blog.deleteOne({ _id: id });
    if (blog.status === "published") expireBlogs();
    return NextResponse.json({ success: true, message: "Post deleted." });
  } catch (error) {
    return serverError("Deleting the post failed", error);
  }
}
