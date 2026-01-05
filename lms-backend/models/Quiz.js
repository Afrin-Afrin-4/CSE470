const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  order: {
    type: Number,
    default: 0
  }
});

const quizSchema = new mongoose.Schema({
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
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true
  },
  questions: [quizQuestionSchema],
  totalPoints: {
    type: Number,
    default: 0
  },
  timeLimit: {
    type: Number, // in minutes
    default: 0 // 0 means no time limit
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);