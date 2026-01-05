const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
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
  feedback: {
    type: String
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);