import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole, serverError } from "@/lib/auth/require-admin";
import { loadForUser } from "@/lib/server/blog-access";
import { loadBlog, toBlogDetail } from "@/lib/server/blogs";
import { withdrawTarget } from "@/lib/blog-rules";
import { Blog } from "@/models/Blog";

type Context = { params: Promise<{ id: string }> };

// POST /api/blogs/mine/:id/withdraw — take a post (or an edit) back from review,
// so it can be changed. It returns to draft.
export async function POST(_request: Request, { params }: Context) {
  const { id } = await params;

  try {
    const auth = await requireRole(["admin", "member", "normal"]);
    if ("response" in auth) return auth.response;

    await connectDB();
    const found = await loadForUser(id, auth.user);
    if ("response" in found) return found.response;
    const { blog, mine } = found;
    if (!mine) {
      return NextResponse.json(
        { success: false, message: "Only the author can withdraw this post." },
        { status: 403 }
      );
    }

    const target = withdrawTarget({
      status: blog.status as "draft",
      revision: (blog.revision?.state as "draft" | undefined) ?? null,
    });
    if (!target) {
      return NextResponse.json(
        { success: false, message: "Nothing of yours is waiting for review on this post." },
        { status: 409 }
      );
    }

    await Blog.updateOne(
      { _id: id },
      target === "post" ? { $set: { status: "draft" } } : { $set: { "revision.state": "draft" } }
    );

    const saved = await loadBlog(id);
    return NextResponse.json({ success: true, message: "Withdrawn.", blog: toBlogDetail(saved!) });
  } catch (error) {
    return serverError("Withdrawing the post failed", error);
  }
}
