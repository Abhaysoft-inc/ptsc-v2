import { NextResponse, connection, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole, serverError } from "@/lib/auth/require-admin";
import { badRequest, noStore, pageSizeFrom, pagedRows, parseBody } from "@/lib/server/query";
import { rateLimit } from "@/lib/server/rate-limit";
import {
  LIST_FIELDS,
  blogInputSchema,
  ensureCategories,
  findCategory,
  loadBlog,
  storedFields,
  toBlogDetail,
  toBlogRow,
  type BlogRecord,
} from "@/lib/server/blogs";
import { Blog, BLOG_STATUSES } from "@/models/Blog";

const ANYONE = ["admin", "member", "normal"] as const;

// GET /api/blogs/mine?page=1&status=draft
// The signed-in user's own posts, most recently edited first.
export async function GET(request: NextRequest) {
  // Depends on the signed-in user, so never prerender. Must come before the try/catch.
  await connection();

  try {
    const auth = await requireRole([...ANYONE]);
    if ("response" in auth) return auth.response;

    const params = request.nextUrl.searchParams;
    const status = BLOG_STATUSES.find((s) => s === params.get("status"));
    const filter = { authorId: auth.user.id, ...(status ? { status } : {}) };

    await connectDB();
    const { paging, rows } = await pagedRows(
      params,
      pageSizeFrom(params),
      Blog.countDocuments(filter),
      (skip, limit) =>
        Blog.find(filter, LIST_FIELDS).sort({ updatedAt: -1, _id: -1 }).skip(skip).limit(limit).lean()
    );

    const authorName = `${auth.user.firstName} ${auth.user.lastName}`.trim();
    return NextResponse.json(
      {
        success: true,
        posts: rows.map((r) => toBlogRow(r as unknown as BlogRecord, authorName)),
        page: paging.page,
        pageSize: paging.pageSize,
        total: paging.total,
        totalPages: paging.totalPages,
      },
      noStore
    );
  } catch (error) {
    return serverError("Listing your posts failed", error);
  }
}

// POST /api/blogs/mine — start a new post. It is saved as a draft; submitting it
// for review is a separate step.
export async function POST(request: Request) {
  try {
    const auth = await requireRole([...ANYONE]);
    if ("response" in auth) return auth.response;

    const limited = await rateLimit(request, {
      name: "blog-create",
      limit: 20,
      windowSeconds: 60 * 60,
      by: auth.user.id,
    });
    if (limited) return limited;

    const body = await parseBody(request, blogInputSchema, "Please fix the highlighted fields.");
    if ("response" in body) return body.response;

    await connectDB();
    await ensureCategories();
    const category = await findCategory(body.data.category);
    if (!category) {
      return badRequest("That category doesn't exist. Pick one from the list, or add it.", {
        category: "Pick a category from the list.",
      });
    }

    const created = await Blog.create({
      ...storedFields(body.data, category),
      authorId: auth.user.id,
      status: "draft",
    });
    const blog = await loadBlog(created._id.toString());
    return NextResponse.json(
      { success: true, message: "Draft saved.", blog: toBlogDetail(blog!) },
      { status: 201 }
    );
  } catch (error) {
    return serverError("Saving the post failed", error);
  }
}
