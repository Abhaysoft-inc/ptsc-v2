import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { PipelineStage, Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { escapeRegex } from "@/lib/server/query";
import { BLOGS_TAG, ensureCategories } from "@/lib/server/blogs";
import type { PublicBlog, PublicBlogCard } from "@/lib/types/blog";
import { Blog } from "@/models/Blog";
import { BlogCategory } from "@/models/BlogCategory";

// Reads for the public site. Only published posts, only their live fields (never a
// pending revision), cached, and refreshed whenever a post is approved, edited,
// unpublished or deleted (the "blogs" tag).

const LIVE = { status: "published" } as const;

interface AuthorJoin {
  firstName?: string;
  lastName?: string;
  batch?: number;
  imageSrc?: string;
}

interface CardRow {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
  coverAlt?: string;
  category?: string;
  categoryKey?: string;
  tags?: string[];
  publishedAt?: Date;
  readMinutes?: number;
  featured?: boolean;
  author?: AuthorJoin[];
}

type FullRow = CardRow & {
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedUpdatedAt?: Date;
  updatedAt?: Date;
};

const authorLookup: PipelineStage = {
  $lookup: {
    from: "users",
    localField: "authorId",
    foreignField: "_id",
    pipeline: [{ $project: { firstName: 1, lastName: 1, batch: 1, imageSrc: 1 } }],
    as: "author",
  },
};

const CARD_PROJECTION = {
  slug: 1,
  title: 1,
  excerpt: 1,
  coverImageUrl: 1,
  coverAlt: 1,
  category: 1,
  categoryKey: 1,
  tags: 1,
  publishedAt: 1,
  readMinutes: 1,
  featured: 1,
  author: 1,
} as const;

function toCard(row: CardRow): PublicBlogCard {
  const a = row.author?.[0];
  return {
    id: row._id.toString(),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    coverImageUrl: row.coverImageUrl ?? "",
    coverAlt: row.coverAlt ?? "",
    category: row.category || "Other",
    categoryKey: row.categoryKey ?? "other",
    tags: row.tags ?? [],
    publishedAt: (row.publishedAt ?? new Date(0)).toISOString(),
    readMinutes: row.readMinutes ?? 1,
    featured: Boolean(row.featured),
    author: {
      name: a ? `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() || "PTSC member" : "PTSC member",
      batch: a?.batch ?? null,
      image: a?.imageSrc ?? "",
    },
  };
}

// ------------------------------------------------------------- lists ----

export interface PublicBlogFilter {
  page?: number;
  pageSize?: number;
  /** A category key, like "campus-life". */
  category?: string;
  tag?: string;
  q?: string;
}

export interface PublicBlogPage {
  posts: PublicBlogCard[];
  /** The featured post, on the first unfiltered page only. */
  featured: PublicBlogCard | null;
  page: number;
  totalPages: number;
  total: number;
}

/**
 * One page of published posts, newest first. The featured post (if any) is returned
 * separately on the first page of the unfiltered list and left out of `posts`.
 */
export async function getPublicBlogs(filter: PublicBlogFilter = {}): Promise<PublicBlogPage> {
  "use cache";
  cacheTag(BLOGS_TAG);
  cacheLife("minutes");

  const pageSize = Math.min(24, Math.max(1, filter.pageSize ?? 9));
  const wanted = Math.max(1, Math.floor(filter.page ?? 1));
  const q = (filter.q ?? "").trim().slice(0, 60);
  const unfiltered = !filter.category && !filter.tag && !q;

  await connectDB();

  const match: Record<string, unknown> = { ...LIVE };
  if (filter.category) match.categoryKey = filter.category;
  if (filter.tag) match.tags = filter.tag;
  if (q) {
    const re = { $regex: escapeRegex(q), $options: "i" };
    match.$or = [{ title: re }, { excerpt: re }, { tags: re }];
  }

  // The spotlight is only on the first page of the plain list.
  const showFeatured = unfiltered && wanted === 1;
  const spotlight = showFeatured
    ? await Blog.aggregate<CardRow>([
        { $match: { ...LIVE, featured: true } },
        { $sort: { publishedAt: -1, _id: -1 } },
        { $limit: 1 },
        authorLookup,
        { $project: CARD_PROJECTION },
      ])
    : [];
  const featured = spotlight[0] ? toCard(spotlight[0]) : null;
  const listMatch = featured ? { ...match, _id: { $ne: spotlight[0]._id } } : match;

  const fetchPage = (page: number) =>
    Blog.aggregate<CardRow>([
      { $match: listMatch },
      { $sort: { publishedAt: -1, _id: -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
      authorLookup,
      { $project: CARD_PROJECTION },
    ]);

  const [total, rows] = await Promise.all([Blog.countDocuments(listMatch), fetchPage(wanted)]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // A page past the end shows the last page instead of nothing.
  const page = Math.min(wanted, totalPages);
  const posts = page === wanted ? rows : await fetchPage(page);

  return { posts: posts.map(toCard), featured, page, totalPages, total };
}

/** The newest published posts, for the home page. */
export async function getLatestBlogs(limit = 3): Promise<PublicBlogCard[]> {
  "use cache";
  cacheTag(BLOGS_TAG);
  cacheLife("minutes");

  await connectDB();
  const rows = await Blog.aggregate<CardRow>([
    { $match: LIVE },
    { $sort: { publishedAt: -1, _id: -1 } },
    { $limit: limit },
    authorLookup,
    { $project: CARD_PROJECTION },
  ]);
  return rows.map(toCard);
}

/** Categories that have at least one published post, with how many. */
export async function getPublicBlogCategories(): Promise<{ name: string; key: string; count: number }[]> {
  "use cache";
  cacheTag(BLOGS_TAG);
  cacheLife("minutes");

  await connectDB();
  await ensureCategories();
  const [categories, usage] = await Promise.all([
    BlogCategory.find({}).sort({ createdAt: 1, name: 1 }).lean(),
    Blog.aggregate<{ _id: string; n: number }>([
      { $match: LIVE },
      { $group: { _id: "$categoryKey", n: { $sum: 1 } } },
    ]),
  ]);
  const used = new Map(usage.map((u) => [u._id, u.n]));
  return categories
    .map((c) => ({ name: c.name, key: c.key, count: used.get(c.key) ?? 0 }))
    .filter((c) => c.count > 0);
}

// ---------------------------------------------------------- one post ----

export type PublicBlogResult =
  | { kind: "post"; post: PublicBlog; related: PublicBlogCard[] }
  /** The post was renamed at some point: the old address redirects to the current one. */
  | { kind: "moved"; slug: string }
  | { kind: "missing" };

/** A published post by its address, with a few related posts. */
export async function getPublicBlog(slug: string): Promise<PublicBlogResult> {
  "use cache";
  cacheTag(BLOGS_TAG);
  cacheLife("minutes");

  await connectDB();
  const [row] = await Blog.aggregate<FullRow>([
    { $match: { ...LIVE, slug } },
    { $limit: 1 },
    authorLookup,
    {
      $project: {
        ...CARD_PROJECTION,
        content: 1,
        seoTitle: 1,
        seoDescription: 1,
        publishedUpdatedAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!row) {
    const moved = await Blog.findOne({ ...LIVE, previousSlugs: slug }, { slug: 1 }).lean();
    return moved?.slug ? { kind: "moved", slug: moved.slug } : { kind: "missing" };
  }

  const card = toCard(row);
  const related = await Blog.aggregate<CardRow>([
    { $match: { ...LIVE, _id: { $ne: row._id }, categoryKey: row.categoryKey } },
    { $sort: { publishedAt: -1, _id: -1 } },
    { $limit: 3 },
    authorLookup,
    { $project: CARD_PROJECTION },
  ]);
  // Fill up with the newest posts from other categories when the category is small.
  const extra =
    related.length < 3
      ? await Blog.aggregate<CardRow>([
          {
            $match: {
              ...LIVE,
              _id: { $nin: [row._id, ...related.map((r) => r._id)] },
            },
          },
          { $sort: { publishedAt: -1, _id: -1 } },
          { $limit: 3 - related.length },
          authorLookup,
          { $project: CARD_PROJECTION },
        ])
      : [];

  return {
    kind: "post",
    post: {
      ...card,
      content: row.content,
      seoTitle: row.seoTitle ?? "",
      seoDescription: row.seoDescription ?? "",
      updatedAt: (row.publishedUpdatedAt ?? row.updatedAt ?? row.publishedAt ?? new Date(0)).toISOString(),
    },
    related: [...related, ...extra].map(toCard),
  };
}

// ------------------------------------------------------- sitemap, feed ----

export interface BlogIndexEntry {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  authorName: string;
}

/** Every published post, newest first: for the sitemap and the RSS feed. */
export async function getBlogIndex(limit = 500): Promise<BlogIndexEntry[]> {
  "use cache";
  cacheTag(BLOGS_TAG);
  cacheLife("minutes");

  await connectDB();
  const rows = await Blog.aggregate<CardRow & { publishedUpdatedAt?: Date; updatedAt?: Date }>([
    { $match: LIVE },
    { $sort: { publishedAt: -1, _id: -1 } },
    { $limit: limit },
    authorLookup,
    { $project: { ...CARD_PROJECTION, publishedUpdatedAt: 1, updatedAt: 1 } },
  ]);
  return rows.map((r) => {
    const card = toCard(r);
    return {
      slug: card.slug,
      title: card.title,
      excerpt: card.excerpt,
      category: card.category,
      publishedAt: card.publishedAt,
      updatedAt: (r.publishedUpdatedAt ?? r.updatedAt ?? r.publishedAt ?? new Date(0)).toISOString(),
      authorName: card.author.name,
    };
  });
}
