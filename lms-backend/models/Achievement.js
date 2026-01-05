const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }
});

// Prevent duplicate achievements
AchievementSchema.index({ user: 1, badge: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', AchievementSchema);