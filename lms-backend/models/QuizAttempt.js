const mongoose = require('mongoose');

const quizAnswerSchema = new mongoose.Schema({
  questionId: {
    type: String, // Using string since we'll store the question index
    required: true
  },
  selectedOption: {
    type: String, // Index of the selected option
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  pointsAwarded: {
    type: Number,
    default: 0
  }
});

const quizAttemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [quizAnswerSchema],
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeTaken: {
    type: Number // in seconds
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);