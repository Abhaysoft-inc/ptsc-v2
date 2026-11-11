import mongoose from "mongoose";

const { Schema } = mongoose;

// One document per rate-limit bucket (e.g. "login:1.2.3.4:a@b.com"). Counters
// live in MongoDB rather than memory because serverless instances come and go,
// and each would otherwise start its own count at zero. MongoDB deletes expired
// buckets itself through the TTL index on `resetAt`.
const rateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true },
  resetAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

export type RateLimitDoc = mongoose.InferSchemaType<typeof rateLimitSchema>;

export const RateLimit: mongoose.Model<RateLimitDoc> =
  (mongoose.models.RateLimit as mongoose.Model<RateLimitDoc> | undefined) ??
  mongoose.model<RateLimitDoc>("RateLimit", rateLimitSchema);
