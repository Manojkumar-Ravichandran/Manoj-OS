import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide an event title."],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    start: {
      type: Date,
      required: [true, "Please provide a start date."],
    },
    end: {
      type: Date,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["Work", "Personal", "Meeting", "Finance", "Important"],
      default: "Personal",
    },
    color: {
      type: String,
      default: "#3b82f6",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
