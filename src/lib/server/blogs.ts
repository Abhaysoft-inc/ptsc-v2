import "server-only";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import type { Types } from "mongoose";
import { Blog, type BlogDoc } from "@/models/Blog";
import { BlogCategory } from "@/models/BlogCategory";
import { categoryKey, makeExcerpt, readMinutes, slugify } from "@/lib/blog-text";
import { optionalUrl, text } from "@/lib/server/events";
import {
  DEFAULT_BLOG_CATEGORIES,
  type BlogDetail,
  type BlogFields,
  type BlogInput,
  type BlogRow,
  type RevisionState,
} from "@/lib/types/blog";

/** Cache tag shared by every cached public read of blog data. */
export const BLOGS_TAG = "blogs";

/** Makes the public blog pages (and the sitemap and feed) pick up a change straight away. */
export function expireBlogs() {
  revalidateTag(BLOGS_TAG, { expire: 0 });
}

// ----------------------------------------------------------- validation ----

/** What the editor sends. Each field is checked here, whatever the browser did. */
export const blogInputSchema = z.object({
  title: text(150).min(5, "Give the post a title of at least 5 characters."),
  excerpt: text(300).default(""),
  content: z.string().max(50_000, "That's too long. Keep a post under 50,000 characters.").default(""),
  category: text(30).min(2, "Choose a category."),
  tags: z
    .array(text(30))
    .max(8, "Use at most 8 tags.")
    // Drop blanks and repeats (ignoring case), keeping the first spelling.
    .transform((tags) => {
      const seen = new Set<string>();
      return tags.filter((t) => {
        const key = t.toLowerCase();
        if (!t || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    })
    .default([]),
  coverImageUrl: optionalUrl.transform((v) => v ?? ""),
  coverAlt: text(150).default(""),
  seoTitle: text(60).default(""),
  seoDescription: text(160).default(""),
}) satisfies z.ZodType<BlogInput, unknown>;

/** A category name: 2-30 characters, letters, numbers, spaces, "&" and "-". */
export const categoryNameSchema = z
  .string()
  .transform((v) => v.trim().replace(/\s+/g, " "))
  .pipe(
    z
      .string()
      .min(2, "A category name needs at least 2 characters.")
      .max(30, "Keep a category name under 30 characters.")
      .regex(/^[A-Za-z0-9][A-Za-z0-9 &-]*$/, "Use letters, numbers, spaces, & and - only.")
  );

// ----------------------------------------------------------- categories ----

function ignoreDuplicates(error: unknown) {
  const writeErrors = (error as { writeErrors?: { code?: number }[] }).writeErrors;
  const dup =
    (error as { code?: number }).code === 11000 ||
    (Array.isArray(writeErrors) && writeErrors.every((e) => e.code === 11000));
  if (!dup) throw error;
}

/** Creates the starting categories the first time any are read. Safe to run twice at once. */
export async function ensureCategories() {
  if ((await BlogCategory.estimatedDocumentCount()) > 0) return;
  try {
    await BlogCategory.insertMany(
      DEFAULT_BLOG_CATEGORIES.map((name) => ({ name, key: categoryKey(name) })),
      { ordered: false }
    );
  } catch (error) {
    ignoreDuplicates(error);
  }
}

/** An existing category by name (ignoring case), or null. */
export async function findCategory(name: string) {
  return BlogCategory.findOne({ key: categoryKey(name) }).lean();
}

/** Returns the category with this name, creating it if it doesn't exist yet. */
export async function findOrCreateCategory(name: string, userId: string) {
  const key = categoryKey(name);
  const existing = await BlogCategory.findOne({ key }).lean();
  if (existing) return { category: existing, created: false };
  try {
    const created = await BlogCategory.create({ name, key, createdBy: userId });
    return { category: created.toObject(), created: true };
  } catch (error) {
    ignoreDuplicates(error); // two people added it at the same instant
    const winner = await BlogCategory.findOne({ key }).lean();
    return { category: winner!, created: false };
  }
}

// ---------------------------------------------------------------- slugs ----

export async function uniqueBlogSlug(title: string, excludeId?: string) {
  const base = slugify(title).slice(0, 80) || "post";
  let candidate = base;
  for (let n = 2; n < 500; n++) {
    const taken = await Blog.exists({
      $or: [{ slug: candidate }, { previousSlugs: candidate }],
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (!taken) return candidate;
    candidate = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

// ------------------------------------------------------------- mapping ----

type Authorish = { _id: Types.ObjectId; firstName?: string; lastName?: string };
/** A post as read with its author populated (or not). */
export type BlogRecord = Omit<BlogDoc, "authorId"> & {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  authorId: Types.ObjectId | Authorish | null;
};

/** Fields to read for a list: everything except the (large) Markdown bodies. */
export const LIST_FIELDS = "-content -revision.content";

const iso = (d: Date | null | undefined) => (d ? new Date(d).toISOString() : null);

function authorOf(b: BlogRecord) {
  const a = b.authorId;
  if (a && typeof a === "object" && "firstName" in a) {
    return { id: String(a._id), name: `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() || "Former member" };
  }
  return { id: a ? String(a) : "", name: a ? "" : "Former member" };
}

/** The author's id whether or not it was populated. */
export function authorIdOf(b: BlogRecord) {
  return authorOf(b).id;
}

export function toBlogRow(b: BlogRecord, authorName?: string): BlogRow {
  const author = authorOf(b);
  const revision = b.revision?.state
    ? {
        state: b.revision.state as RevisionState,
        reviewNote: b.revision.reviewNote ?? "",
        submittedAt: iso(b.revision.submittedAt),
      }
    : null;
  return {
    id: b._id.toString(),
    title: b.title,
    excerpt: b.excerpt ?? "",
    category: b.category ?? "",
    status: b.status as BlogRow["status"],
    featured: Boolean(b.featured),
    coverImageUrl: b.coverImageUrl ?? "",
    slug: b.slug ?? null,
    authorId: author.id,
    authorName: author.name || authorName || "",
    readMinutes: b.readMinutes ?? 1,
    createdAt: iso(b.createdAt),
    updatedAt: iso(b.updatedAt),
    submittedAt: iso(b.submittedAt),
    publishedAt: iso(b.publishedAt),
    reviewNote: b.reviewNote ?? "",
    revision,
    reviewKind:
      b.status === "pending" ? "new" : revision?.state === "pending" ? "edit" : null,
  };
}

type EditableSource = {
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  tags?: string[] | null;
  coverImageUrl?: string | null;
  coverAlt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function fieldsOf(src: EditableSource): BlogFields {
  return {
    title: src.title ?? "",
    excerpt: src.excerpt ?? "",
    content: src.content ?? "",
    category: src.category ?? "",
    tags: src.tags ?? [],
    coverImageUrl: src.coverImageUrl ?? "",
    coverAlt: src.coverAlt ?? "",
    seoTitle: src.seoTitle ?? "",
    seoDescription: src.seoDescription ?? "",
  };
}

/** A post in full. `fields` is the revision when a published post has an edit in progress. */
export function toBlogDetail(b: BlogRecord): BlogDetail {
  const row = toBlogRow(b);
  const hasRevision = b.status === "published" && b.revision?.state;
  return {
    ...row,
    fields: fieldsOf(hasRevision ? (b.revision as EditableSource) : b),
    live: hasRevision ? fieldsOf(b) : null,
  };
}

/** The values to store for a set of edited fields (excerpt and reading time included). */
export function storedFields(input: BlogInput, category: { name: string; key: string }) {
  return {
    title: input.title,
    excerpt: input.excerpt || makeExcerpt(input.content),
    content: input.content,
    category: category.name,
    categoryKey: category.key,
    tags: input.tags,
    coverImageUrl: input.coverImageUrl,
    coverAlt: input.coverAlt,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    readMinutes: readMinutes(input.content),
  };
}

/** One post with its author populated, or null. */
export async function loadBlog(id: string): Promise<BlogRecord | null> {
  const doc = await Blog.findById(id).populate("authorId", "firstName lastName").lean();
  return doc as unknown as BlogRecord | null;
}
