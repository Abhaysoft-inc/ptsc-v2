import mongoose from "mongoose";

const { Schema } = mongoose;

// Mirrors the old site's `events` collection (ptsc-website/backend/Models/event.js).
// Only the fields this app reads are declared; strict:false keeps the rest
// (registrationFields, emailSummary, winners, ...) intact on save.
const eventSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now, index: true },
    time: String,
    // "upcoming" | "past" in the existing data.
    status: { type: String, index: true },
    registrationType: {
      type: String,
      enum: ["individual", "team"],
      default: "individual",
    },
    completed: { type: Boolean, default: false },
  },
  { strict: false }
);

export type EventDoc = mongoose.InferSchemaType<typeof eventSchema>;

export const Event: mongoose.Model<EventDoc> =
  (mongoose.models.Event as mongoose.Model<EventDoc> | undefined) ??
  mongoose.model<EventDoc>("Event", eventSchema);
