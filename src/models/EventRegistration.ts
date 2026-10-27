import mongoose from "mongoose";

const { Schema } = mongoose;

// Mirrors the old site's `eventregistrations` collection
// (ptsc-website/backend/Models/eventRegistration.js).

const participantSchema = new Schema(
  {
    name: { type: String, required: true },
    gender: { type: String, required: true },
    rollNo: { type: String, required: true },
    year: Number, // 1-4, derived from the roll number
    branch: String, // derived from the roll number
    contactNo: { type: String, required: true },
    email: { type: String, required: true },
    dynamic: { type: Object, default: {} },
  },
  { _id: false }
);

const eventRegistrationSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  type: {
    type: String,
    enum: ["individual", "team"],
    default: "individual",
    index: true,
  },
  // Human-facing ID, e.g. PTSC25E123.
  registrationId: { type: String, unique: true, index: true },
  // Individual registration fields. Team registrations keep their people in
  // `participants` instead.
  name: String,
  gender: String,
  rollNo: String,
  year: Number,
  branch: String,
  contactNo: String,
  email: String,
  dynamic: { type: Object, default: {} },
  team: {
    teamName: String,
    dynamic: { type: Object, default: {} },
  },
  participants: { type: [participantSchema], default: [] },
  leaderIndex: { type: Number, default: 0 },
  attended: { type: Boolean, default: false },
  attendedAt: { type: Date, default: null },
  // Soft delete. A few old documents have no `deleted` field at all, so query
  // with `deleted: { $ne: true }` rather than `deleted: false`.
  deleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export type EventRegistrationDoc = mongoose.InferSchemaType<
  typeof eventRegistrationSchema
>;

export const EventRegistration: mongoose.Model<EventRegistrationDoc> =
  (mongoose.models.EventRegistration as
    | mongoose.Model<EventRegistrationDoc>
    | undefined) ??
  mongoose.model<EventRegistrationDoc>(
    "EventRegistration",
    eventRegistrationSchema
  );
