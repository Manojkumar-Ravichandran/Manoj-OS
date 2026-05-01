import mongoose from "mongoose";

const InstrumentSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, unique: true, index: true },
    ltp: Number,
    lastUpdated: Date,
    lastCandleTime: Date
  },
  { timestamps: true }
);

const Instrument = mongoose.models.Instrument || mongoose.model("Instrument", InstrumentSchema);

export default Instrument;
