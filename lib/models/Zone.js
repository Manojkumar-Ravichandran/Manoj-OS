import mongoose from "mongoose";

const CandleSchema = new mongoose.Schema(
  {
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number
  },
  { _id: false }
);

const ZoneSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, index: true },
    type: { type: String, enum: ["VRZ_HIGH", "VRZ_LOW"], required: true },
    timeframe: { type: String, default: "30m" },
    zoneHigh: { type: Number, required: true },
    zoneLow: { type: Number, required: true },
    zonePrice: { type: Number, required: true },
    sourceTime: { type: Date, required: true, index: true },
    sourceCandle: CandleSchema,
    isActive: { type: Boolean, default: true, index: true },
    brokenAt: Date,
    breakPrice: Number,
    touchCount: { type: Number, default: 0 },
    lastCheckedAt: Date
  },
  { timestamps: true }
);

ZoneSchema.index({ symbol: 1, type: 1, sourceTime: 1 }, { unique: true });

const Zone = mongoose.models.Zone || mongoose.model("Zone", ZoneSchema);

export default Zone;
