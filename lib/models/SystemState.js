import mongoose from "mongoose";

const SystemStateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    lastRunAt: Date,
    lastUpdated: Date,
    lastError: String,
    lastAlertAt: Date,
    lastAlertSlot: String
  },
  { timestamps: true }
);

const SystemState = mongoose.models.SystemState || mongoose.model("SystemState", SystemStateSchema);

export default SystemState;
