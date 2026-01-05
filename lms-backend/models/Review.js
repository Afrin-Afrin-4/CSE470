const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5']
  },
  review: {
    type: String,
    required: false,
    maxlength: [500, 'Review cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure a user can only review a course once
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);