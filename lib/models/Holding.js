import mongoose from "mongoose";

const HoldingSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Please provide a purchase date."],
    },
    broker: {
      type: String,
      required: [true, "Please specify the broker."],
    },
    stockName: {
      type: String,
      required: [true, "Please provide the stock name."],
    },
    symbol: {
      type: String,
      required: [true, "Please provide the stock symbol."],
    },
    quantity: {
      type: Number,
      required: [true, "Please provide the quantity."],
    },
    avgPrice: {
      type: Number,
      required: [true, "Please provide the average price."],
    },
    pe: {
      type: Number,
    },
    chartAnalysis: {
      type: String, // Store as base64 string for simplicity
    },
    notes: {
      type: String,
    },
    history: [
      {
        date: Date,
        quantity: Number,
        price: Number,
        broker: String,
        pe: Number,
      }
    ],
  },
  { timestamps: true }
);

// Force re-registration of the model to apply schema changes in dev mode
if (mongoose.models && mongoose.models.Holding) {
  delete mongoose.models.Holding;
}

export default mongoose.model("Holding", HoldingSchema);
