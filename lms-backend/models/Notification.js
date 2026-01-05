const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  type: {
    type: String,
    enum: ['announcement', 'grade', 'assignment', 'course', 'system'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);