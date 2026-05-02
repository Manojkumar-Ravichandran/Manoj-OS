import mongoose from "mongoose";

const SignalSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, index: true },
    type: { 
      type: String, 
      enum: ["RECLAIMED_BUY", "RECLAIMED_SELL", "NEAR_LOW", "NEAR_HIGH", "BROKEN_LOW", "BROKEN_HIGH", "NONE"],
      required: true 
    },
    price: Number,
    vrzLevel: Number,
    distance: Number,
    touchCount: Number,
    freshness: Number,
    strength: { type: String, enum: ["strong", "normal"] },
    isActive: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

SignalSchema.index({ symbol: 1, type: 1, timestamp: -1 });

const Signal = mongoose.models.Signal || mongoose.model("Signal", SignalSchema);

export default Signal;
