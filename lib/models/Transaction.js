import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Please provide a date for this transaction."],
    },
    type: {
      type: String,
      required: [true, "Please specify the transaction type."],
      enum: ["Income", "Expense"],
    },
    category: {
      type: String,
      required: [true, "Please provide a category."],
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    amount: {
      type: Number,
      required: [true, "Please provide an amount."],
    },
    account: {
      type: String,
      required: [true, "Please specify an account."],
    },
    // Delivery specific fields
    subCategory: { type: String },
    petrol: { type: Number },
    startKm: { type: Number },
    endKm: { type: Number },
    duration: { type: String },
    totalHrs: { type: Number },
    snacks: { type: Number },
    food: { type: Number },
    spend: { type: Number },
    earnings: { type: Number },
  },
  { timestamps: true }
);

// Delete the model from cache to ensure schema updates are applied
if (mongoose.models && mongoose.models.Transaction) {
  delete mongoose.models.Transaction;
}

export default mongoose.model("Transaction", TransactionSchema);
