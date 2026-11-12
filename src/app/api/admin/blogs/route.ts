import type { QueryFilter } from "mongoose";
import { NextResponse, connection, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireStaff, serverError } from "@/lib/auth/require-admin";
import { escapeRegex, noStore, pageSizeFrom, pagedRows, searchText } from "@/lib/server/query";
import { LIST_FIELDS, toBlogRow, type BlogRecord } from "@/lib/server/blogs";
import type { BlogCounts } from "@/lib/types/blog";
import { Blog, type BlogDoc } from "@/models/Blog";

/** New posts waiting for review, and edits of published posts waiting for review. */
const QUEUE: QueryFilter<BlogDoc> = { $or: [{ status: "pending" }, { status: "published", "revision.state": "pending" }] };

const FILTERS: Record<"queue" | "published" | "draft" | "rejected" | "all", QueryFilter<BlogDoc>> = {
  queue: QUEUE,
  published: { status: "published" },
  draft: { status: "draft" },
  rejected: { status: "rejected" },
  all: {},
};

// GET /api/admin/blogs?status=queue|published|draft|rejected|all&q=...&page=1
// For reviewers (admins and members). The review queue is the default, oldest first.
export async function GET(request: NextRequest) {
  await connection();

  try {
    const auth = await requireStaff();
    if ("response" in auth) return auth.response;

    const params = request.nextUrl.searchParams;
    const view = (Object.keys(FILTERS) as (keyof typeof FILTERS)[]).find((k) => k === params.get("status")) ?? "queue";
    const q = searchText(params);
    const filter = q
      ? { $and: [FILTERS[view], { title: { $regex: escapeRegex(q), $options: "i" } }] }
      : FILTERS[view];

    await connectDB();
    // The list, its total and the tab counts are all asked for at the same time.
    const [counts, { paging, rows }] = await Promise.all([
      Promise.all([
        Blog.countDocuments(QUEUE),
        Blog.countDocuments({ status: "published" }),
        Blog.countDocuments({ status: "draft" }),
        Blog.countDocuments({ status: "rejected" }),
      ]).then(([queue, published, draft, rejected]): BlogCounts => ({ queue, published, draft, rejected })),
      pagedRows(params, pageSizeFrom(params), Blog.countDocuments(filter), (skip, limit) =>
        Blog.find(filter, LIST_FIELDS)
          .populate("authorId", "firstName lastName")
          .sort(view === "queue" ? { updatedAt: 1, _id: 1 } : { updatedAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
      ),
    ]);

    return NextResponse.json(
      {
        success: true,
        posts: rows.map((r) => toBlogRow(r as unknown as BlogRecord)),
        counts,
        page: paging.page,
        pageSize: paging.pageSize,
        total: paging.total,
        totalPages: paging.totalPages,
      },
      noStore
    );
  } catch (error) {
    return serverError("Listing posts failed", error);
  }
}
