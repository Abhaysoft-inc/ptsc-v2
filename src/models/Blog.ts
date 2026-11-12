import mongoose from "mongoose";

const { Schema } = mongoose;

// A blog post. Anyone signed in can write one; it goes public only after a
// reviewer (admin or member) approves it. A published post that its author edits
// keeps its live content and holds the edit in `revision` until it is approved.

export const BLOG_STATUSES = ["draft", "pending", "rejected", "published"] as const;
export const REVISION_STATES = ["draft", "pending", "rejected"] as const;

/** The fields an author edits, shared by the post and by its revision. */
const editable = {
  title: { type: String, required: true },
  excerpt: { type: String, default: "" },
  content: { type: String, default: "" },
  category: { type: String, default: "" },
  categoryKey: { type: String, default: "" },
  tags: { type: [String], default: [] },
  coverImageUrl: { type: String, default: "" },
  coverAlt: { type: String, default: "" },
  seoTitle: { type: String, default: "" },
  seoDescription: { type: String, default: "" },
  readMinutes: { type: Number, default: 1 },
};

const revisionSchema = new Schema(
  {
    ...editable,
    state: { type: String, enum: REVISION_STATES, default: "draft" },
    reviewNote: { type: String, default: "" },
    submittedAt: Date,
  },
  { _id: false }
);

const blogSchema = new Schema(
  {
    ...editable,
    // Assigned the first time the post is published, then fixed so links keep working.
    slug: { type: String, unique: true, sparse: true },
    previousSlugs: { type: [String], default: [] },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: BLOG_STATUSES, default: "draft", index: true },
    reviewNote: { type: String, default: "" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    submittedAt: Date,
    publishedAt: Date,
    // When the LIVE content last changed. Drives dateModified and the sitemap.
    publishedUpdatedAt: Date,
    revision: revisionSchema,
    featured: { type: Boolean, default: false },
    // Marks seeded sample posts, so they can be re-seeded or removed cleanly.
    seedKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

blogSchema.index({ status: 1, publishedAt: -1 }); // the public list
blogSchema.index({ authorId: 1, updatedAt: -1 }); // "my posts"
blogSchema.index({ status: 1, submittedAt: 1 }); // the review queue
blogSchema.index({ "revision.state": 1 }); // edits waiting for review
blogSchema.index({ categoryKey: 1, status: 1 });

export type BlogDoc = mongoose.InferSchemaType<typeof blogSchema>;

export const Blog: mongoose.Model<BlogDoc> =
  (mongoose.models.Blog as mongoose.Model<BlogDoc> | undefined) ??
  mongoose.model<BlogDoc>("Blog", blogSchema);
