import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  subtitle: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Financial', 'System', 'Market', 'Personal', 'Price'],
    default: 'Personal',
  },
  symbol: {
    type: String,
    trim: true,
  },
  targetPrice: {
    type: Number,
  },
  type: {
    type: String,
    enum: ['One-time', 'Recurring'],
    default: 'One-time',
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date'],
  },
  status: {
    type: String,
    enum: ['Active', 'Snoozed', 'Completed'],
    default: 'Active',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

if (mongoose.models.Alert) {
  delete mongoose.models.Alert;
}

export default mongoose.model('Alert', AlertSchema);
