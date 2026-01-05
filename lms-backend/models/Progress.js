const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonsCompleted: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  overallProgress: {
    type: Number,
    default: 0, // Percentage
    min: 0,
    max: 100
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure a user can only have one progress record per course
progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);