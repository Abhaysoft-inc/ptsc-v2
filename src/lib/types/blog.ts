// Shapes shared by the blog API routes, the dashboard and the public pages.
// Dates are ISO strings.

/** Created the first time categories are read. People can add more. */
export const DEFAULT_BLOG_CATEGORIES = [
  "Engineering",
  "Design",
  "Career",
  "Campus Life",
  "Tutorial",
  "Other",
] as const;

export type BlogStatus = "draft" | "pending" | "rejected" | "published";
/** The state of an edit to an already published post. */
export type RevisionState = "draft" | "pending" | "rejected";

/** Everything an author edits. A published post can hold one set live and one as a revision. */
export interface BlogFields {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImageUrl: string;
  coverAlt: string;
  seoTitle: string;
  seoDescription: string;
}

/** What the editor sends to save a post. */
export type BlogInput = BlogFields;

/** A post in a dashboard list. */
export interface BlogRow {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  status: BlogStatus;
  featured: boolean;
  coverImageUrl: string;
  /** Set once the post has been published. */
  slug: string | null;
  authorId: string;
  authorName: string;
  readMinutes: number;
  createdAt: string | null;
  updatedAt: string | null;
  submittedAt: string | null;
  publishedAt: string | null;
  /** The reviewer's note on a rejected new post. */
  reviewNote: string;
  /** An edit to a published post, if there is one. */
  revision: { state: RevisionState; reviewNote: string; submittedAt: string | null } | null;
  /** What a reviewer has to look at: a new post, or an edit of a published one. */
  reviewKind: "new" | "edit" | null;
}

/** One post in full, for the editor and for review. */
export interface BlogDetail extends BlogRow {
  /** The version being edited or reviewed: the revision when there is one. */
  fields: BlogFields;
  /** What is live right now, when `fields` is a revision of a published post. */
  live: BlogFields | null;
}

export interface BlogCategoryRow {
  id: string;
  name: string;
  key: string;
  /** Posts (any status) using it. */
  posts: number;
}

export interface BlogCounts {
  queue: number;
  published: number;
  draft: number;
  rejected: number;
}

// ------------------------------------------------------------ public site ----

export interface PublicBlogCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  coverAlt: string;
  category: string;
  categoryKey: string;
  tags: string[];
  publishedAt: string;
  readMinutes: number;
  featured: boolean;
  author: { name: string; batch: number | null; image: string };
}

export interface PublicBlog extends PublicBlogCard {
  content: string;
  seoTitle: string;
  seoDescription: string;
  /** When the live content last changed. */
  updatedAt: string;
}
