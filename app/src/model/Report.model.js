import mongoose from "mongoose";

// collection for only conencted user
const ReportUserSchema = new mongoose.Schema(
  {
    deviceToken: { type: String, required: true },
    reportCount: { type: Number, default: 1 },
    report: [],
  },
  { timestamps: true }
);
ReportUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
export const ReportUserModel = mongoose.model("report", ReportUserSchema);
