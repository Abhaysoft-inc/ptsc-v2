import mongoose from "mongoose";

const { Schema } = mongoose;

// Mirrors the old site's `users` collection (ptsc-website/backend/Models/user.js)
// so existing accounts work unchanged. Don't rename or retype fields here
// without migrating the data.

export const USER_ROLES = ["admin", "member", "normal"] as const;
export const USER_STATUSES = ["pending", "approved", "denied"] as const;

// "" means no post. "SECRATRY" is a legacy misspelling the old backend accepted.
export const USER_POSTS = [
  "",
  "Secretary",
  "SECRATRY",
  "Joint Secretary",
  "Class Mentor",
  "Competitive Programming Head",
  "Web Development Head",
  "Data Science Head",
  "GenAI Head",
  "App Dev Head",
  "Media and Design Head",
  "Event Head",
  "Executive members",
] as const;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  // Not lowercased: 14 existing usernames contain capitals.
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: [6, "Username must be at least 6 characters long"],
  },
  email: { type: String, required: true, unique: true },
  // Stored as a number (10 digits), as the old site did.
  mobile: { type: Number, required: true },
  // bcrypt hash. select:false so it never leaks through a normal query.
  password: { type: String, required: true, select: false },
  role: { type: String, enum: USER_ROLES, default: "normal", index: true },
  status: { type: String, enum: USER_STATUSES, default: "pending", index: true },
  batch: { type: Number }, // graduation year, e.g. 2027
  post: { type: String, enum: USER_POSTS },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpire: { type: Date, select: false },

  // Public profile fields present on some existing accounts. The old repo
  // never declared them; types match the stored data.
  imageSrc: String,
  rollNo: String,
  domain: String,
  headlineRole: String,
  github: String,
  linkedin: String,
  portfolio: String,
  resume: String,
  availability: String,
  skills: [String],
  achievements: [Schema.Types.Mixed],
  showInHireUs: Boolean,
  hideAchievementsCard: Boolean,
});

export type UserDoc = mongoose.InferSchemaType<typeof userSchema>;

// `models.User` is reused across hot reloads; recompiling would throw.
export const User: mongoose.Model<UserDoc> =
  (mongoose.models.User as mongoose.Model<UserDoc> | undefined) ??
  mongoose.model<UserDoc>("User", userSchema);
