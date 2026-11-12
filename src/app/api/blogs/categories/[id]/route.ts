import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import { isObjectId, notFound } from "@/lib/server/query";
import { expireBlogs } from "@/lib/server/blogs";
import { Blog } from "@/models/Blog";
import { BlogCategory } from "@/models/BlogCategory";

type Context = { params: Promise<{ id: string }> };

// DELETE /api/blogs/categories/:id — reviewers can remove a category no post uses.
export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) return notFound("Category not found.");

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    await connectDB();
    const category = await BlogCategory.findById(id).lean();
    if (!category) return notFound("Category not found.");

    // "Other" is the fallback people can always pick.
    if (category.key === "other") {
      return NextResponse.json(
        { success: false, message: 'The "Other" category can\'t be deleted.' },
        { status: 409 }
      );
    }
    const inUse = await Blog.exists({
      $or: [{ categoryKey: category.key }, { "revision.categoryKey": category.key }],
    });
    if (inUse) {
      return NextResponse.json(
        { success: false, message: "Posts still use this category, so it can't be deleted." },
        { status: 409 }
      );
    }

    await BlogCategory.deleteOne({ _id: id });
    expireBlogs();
    return NextResponse.json({ success: true, message: "Category deleted." });
  } catch (error) {
    return serverError("Deleting the category failed", error);
  }
}
