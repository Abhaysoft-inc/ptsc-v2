import { NextResponse, connection } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireRole, serverError } from "@/lib/auth/require-admin";
import { noStore, parseBody } from "@/lib/server/query";
import { rateLimit } from "@/lib/server/rate-limit";
import { categoryNameSchema, ensureCategories, findOrCreateCategory } from "@/lib/server/blogs";
import type { BlogCategoryRow } from "@/lib/types/blog";
import { Blog } from "@/models/Blog";
import { BlogCategory } from "@/models/BlogCategory";

const ANYONE = ["admin", "member", "normal"] as const;

// GET /api/blogs/categories — every category, with how many posts use it.
export async function GET() {
  await connection();

  try {
    const auth = await requireRole([...ANYONE]);
    if ("response" in auth) return auth.response;

    await connectDB();
    await ensureCategories();
    const [categories, usage] = await Promise.all([
      BlogCategory.find({}).sort({ createdAt: 1, name: 1 }).lean(),
      Blog.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$categoryKey", n: { $sum: 1 } } }]),
    ]);
    const used = new Map(usage.map((u) => [u._id, u.n]));

    const rows: BlogCategoryRow[] = categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      key: c.key,
      posts: used.get(c.key) ?? 0,
    }));
    return NextResponse.json({ success: true, categories: rows }, noStore);
  } catch (error) {
    return serverError("Listing categories failed", error);
  }
}

// POST /api/blogs/categories { name } — add a category from the editor. A name that
// already exists (ignoring case) just returns the existing one.
export async function POST(request: Request) {
  try {
    const auth = await requireRole([...ANYONE]);
    if ("response" in auth) return auth.response;

    const body = await parseBody(request, z.object({ name: categoryNameSchema }), "Check the name.");
    if ("response" in body) return body.response;

    const limited = await rateLimit(request, {
      name: "blog-category",
      limit: 10,
      windowSeconds: 60 * 60,
      by: auth.user.id,
    });
    if (limited) return limited;

    await connectDB();
    await ensureCategories();
    const { category, created } = await findOrCreateCategory(body.data.name, auth.user.id);
    return NextResponse.json(
      {
        success: true,
        created,
        category: { id: category._id.toString(), name: category.name, key: category.key, posts: 0 },
      },
      { status: created ? 201 : 200 }
    );
  } catch (error) {
    return serverError("Adding the category failed", error);
  }
}
