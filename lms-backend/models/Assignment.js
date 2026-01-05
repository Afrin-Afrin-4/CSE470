const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonIndex: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required']
  },
  dueDate: {
    type: Date,
    required: true
  },
  maxPoints: {
    type: Number,
    default: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);