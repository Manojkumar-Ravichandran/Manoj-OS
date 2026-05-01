import mongoose from "mongoose";

const WatchlistSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, "Please provide the stock symbol."],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Force re-registration of the model to apply schema changes in dev mode
if (mongoose.models && mongoose.models.Watchlist) {
  delete mongoose.models.Watchlist;
}

export default mongoose.model("Watchlist", WatchlistSchema);
