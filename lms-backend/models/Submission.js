const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  assignment: {
    type: String,
    required: true
  },
  submissionText: {
    type: String
  },
  submissionFile: {
    type: String // URL to uploaded file
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  gradedAt: {
    type: Date
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  feedback: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
submissionSchema.index({ student: 1, course: 1 });
submissionSchema.index({ course: 1, assignment: 1 });

module.exports = mongoose.model('Submission', submissionSchema);