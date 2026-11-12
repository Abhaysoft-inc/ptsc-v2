import { NextResponse, connection } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import { isObjectId, noStore, notFound, parseBody } from "@/lib/server/query";
import { expireBlogs, loadBlog, toBlogDetail } from "@/lib/server/blogs";
import { Blog } from "@/models/Blog";

type Context = { params: Promise<{ id: string }> };

// GET /api/admin/blogs/:id — a post for review. When an edit of a published post is
// waiting, `fields` is that edit and `live` is what's online now.
export async function GET(_request: Request, { params }: Context) {
  await connection();
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Post not found.");

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    await connectDB();
    const blog = await loadBlog(id);
    if (!blog) return notFound("Post not found.");
    return NextResponse.json({ success: true, blog: toBlogDetail(blog) }, noStore);
  } catch (error) {
    return serverError("Reading the post failed", error);
  }
}

// PATCH /api/admin/blogs/:id { featured } — show a published post in the spotlight.
export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Post not found.");

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    const body = await parseBody(request, z.object({ featured: z.boolean() }), "Invalid request.");
    if ("response" in body) return body.response;

    await connectDB();
    const result = await Blog.updateOne(
      { _id: id, status: "published" },
      { $set: { featured: body.data.featured } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Only published posts can be featured." },
        { status: 409 }
      );
    }
    expireBlogs();
    return NextResponse.json({ success: true, message: body.data.featured ? "Featured." : "No longer featured." });
  } catch (error) {
    return serverError("Updating the post failed", error);
  }
}
