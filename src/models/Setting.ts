import mongoose from "mongoose";

const { Schema } = mongoose;

// Key/value site settings, e.g. { key: "allowSignup", value: true }.
const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export type SettingDoc = mongoose.InferSchemaType<typeof settingSchema>;

export const Setting: mongoose.Model<SettingDoc> =
  (mongoose.models.Setting as mongoose.Model<SettingDoc> | undefined) ??
  mongoose.model<SettingDoc>("Setting", settingSchema);
