import mongoose from "mongoose";

const { Schema } = mongoose;

// Mirrors the old site's `emaillogs` collection
// (ptsc-website/backend/Models/emailLog.js).

// "result_selected_members" isn't in the old schema's enum but exists in the
// data, so it's listed here too.
export const EMAIL_TYPES = [
  "registration",
  "participation",
  "certificate",
  "result_selected_members",
] as const;
export const EMAIL_STATUSES = ["pending", "sent", "failed"] as const;

const emailLogSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
  registrationId: {
    type: Schema.Types.ObjectId,
    ref: "EventRegistration",
    required: true,
    index: true,
  },
  emailType: { type: String, enum: EMAIL_TYPES, required: true, index: true },
  recipientEmail: { type: String, required: true },
  recipientName: String,
  status: { type: String, enum: EMAIL_STATUSES, default: "pending", index: true },
  sentAt: Date,
  failedAt: Date,
  errorMessage: String,
  retryCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

emailLogSchema.index({ eventId: 1, emailType: 1, status: 1 });

export type EmailLogDoc = mongoose.InferSchemaType<typeof emailLogSchema>;

export const EmailLog: mongoose.Model<EmailLogDoc> =
  (mongoose.models.EmailLog as mongoose.Model<EmailLogDoc> | undefined) ??
  mongoose.model<EmailLogDoc>("EmailLog", emailLogSchema);
