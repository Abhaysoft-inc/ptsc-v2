import mongoose from "mongoose";

const { Schema } = mongoose;

// Mirrors the old site's `events` collection (ptsc-website/backend/Models/event.js)
// so existing events work unchanged. Only additive changes: venue, category,
// capacity, published, createdBy and updatedBy are new and optional, so the old
// app can still read and write these documents.
//
// strict:false keeps fields this app doesn't declare (emailSummary, winners, ...)
// intact when old documents are saved.

const formFieldSchema = new Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, default: "text" },
    required: { type: Boolean, default: false },
    placeholder: String,
    description: String,
    validation: String,
    options: { type: [String], default: [] },
    // File inputs: ['.pdf', '.jpg']
    allowedTypes: { type: [String], default: [] },
    maxSizeMB: { type: Number, default: 10 },
  },
  { _id: false }
);

const eventSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    ruleBookUrl: String,
    resources: {
      type: [
        new Schema(
          {
            label: { type: String, required: true },
            url: { type: String, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    // Stored as midnight UTC of the event's calendar day.
    date: { type: Date, default: Date.now, index: true },
    time: String,
    // "upcoming" | "past" in the existing data. The dashboard derives its own
    // status from `date`, `completed` and `published`; this is only read for
    // old rows.
    status: { type: String, index: true },
    googleFormLink: String,
    whatsappGroupLink: String,
    coverImageUrl: String,
    forceGoogleForm: { type: Boolean, default: false },
    useCustomForm: { type: Boolean, default: false },
    // Questions for an individual registrant, or for the team as a whole.
    registrationFields: { type: [formFieldSchema], default: [] },
    registrationType: {
      type: String,
      enum: ["individual", "team"],
      default: "individual",
    },
    teamMinSize: { type: Number, default: 1 },
    teamMaxSize: { type: Number, default: 1 },
    // Questions asked of each team member.
    participantFields: { type: [formFieldSchema], default: [] },
    // Set once the event is over. Gates participation and certificate mails.
    completed: { type: Boolean, default: false },
    completedAt: Date,
    completedBy: { type: Schema.Types.ObjectId, ref: "User" },

    // New in this app. Old events have none of these.
    venue: String,
    category: String,
    // 0 or missing means no limit.
    capacity: Number,
    // Missing counts as published, so every existing event stays visible.
    published: Boolean,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { strict: false }
);

export type EventDoc = mongoose.InferSchemaType<typeof eventSchema>;

export const Event: mongoose.Model<EventDoc> =
  (mongoose.models.Event as mongoose.Model<EventDoc> | undefined) ??
  mongoose.model<EventDoc>("Event", eventSchema);
