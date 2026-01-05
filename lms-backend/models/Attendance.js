const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  session: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
attendanceSchema.index({ student: 1, course: 1, date: -1 });
attendanceSchema.index({ course: 1, session: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);