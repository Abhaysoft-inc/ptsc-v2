import mongoose from "mongoose";

const { Schema } = mongoose;

// Mirrors the old site's `profiles` collection (ptsc-website/backend/Models/profile.js):
// a member's photo, quote and social links, kept apart from the login account.
const profileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  imageUrl: { type: String, default: "" },
  quote: { type: String, default: "" },
  about: { type: String, default: "" },
  socials: {
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
    website: { type: String, default: "" },
  },
  updatedAt: { type: Date, default: Date.now },
});

export type ProfileDoc = mongoose.InferSchemaType<typeof profileSchema>;

export const Profile: mongoose.Model<ProfileDoc> =
  (mongoose.models.Profile as mongoose.Model<ProfileDoc> | undefined) ??
  mongoose.model<ProfileDoc>("Profile", profileSchema);
