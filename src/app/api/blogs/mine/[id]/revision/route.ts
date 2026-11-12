import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole, serverError } from "@/lib/auth/require-admin";
import { loadForUser } from "@/lib/server/blog-access";
import { loadBlog, toBlogDetail } from "@/lib/server/blogs";
import { Blog } from "@/models/Blog";

type Context = { params: Promise<{ id: string }> };

// DELETE /api/blogs/mine/:id/revision — throw away an edit in progress on a
// published post. The live post is untouched.
export async function DELETE(_request: Request, { params }: Context) {
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
        { success: false, message: "Only the author can discard this edit." },
        { status: 403 }
      );
    }
    if (blog.status !== "published" || !blog.revision?.state) {
      return NextResponse.json(
        { success: false, message: "There's no edit in progress on this post." },
        { status: 409 }
      );
    }

    await Blog.updateOne({ _id: id }, { $unset: { revision: "" } });
    const saved = await loadBlog(id);
    return NextResponse.json({ success: true, message: "Edit discarded.", blog: toBlogDetail(saved!) });
  } catch (error) {
    return serverError("Discarding the edit failed", error);
  }
}
