import mongoose from "mongoose";

const { Schema } = mongoose;

// A blog category. A few exist from the start and anyone writing a post can add
// another. `key` is the lower-case slug of the name and is unique, so "design"
// and "Design" are the same category.
const blogCategorySchema = new Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export type BlogCategoryDoc = mongoose.InferSchemaType<typeof blogCategorySchema>;

export const BlogCategory: mongoose.Model<BlogCategoryDoc> =
  (mongoose.models.BlogCategory as mongoose.Model<BlogCategoryDoc> | undefined) ??
  mongoose.model<BlogCategoryDoc>("BlogCategory", blogCategorySchema);
