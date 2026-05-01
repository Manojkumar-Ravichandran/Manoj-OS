import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Done', 'Backlog'],
    default: 'Todo',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  category: {
    type: String,
    enum: ['Finance', 'CRM', 'Work', 'Personal', 'Other'],
    default: 'Personal',
  },
  dueDate: {
    type: Date,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
