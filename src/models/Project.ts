import mongoose from "mongoose";

const { Schema } = mongoose;

// Projects the club's members have built, shown on the public Projects page.
// Staff add and edit them from the dashboard.
export const PROJECT_STATUSES = ["in-progress", "completed"] as const;

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: PROJECT_STATUSES, default: "in-progress" },
    githubUrl: String,
    liveUrl: String,
    imageUrl: String,
    // Free text, e.g. "Anshuman, Diya and Ishaan".
    builtBy: { type: String, default: "" },
    // Featured projects are listed first.
    featured: { type: Boolean, default: false, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type ProjectDoc = mongoose.InferSchemaType<typeof projectSchema>;

export const Project: mongoose.Model<ProjectDoc> =
  (mongoose.models.Project as mongoose.Model<ProjectDoc> | undefined) ??
  mongoose.model<ProjectDoc>("Project", projectSchema);
