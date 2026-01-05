const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
  certificateUrl: {
    type: String,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  certificateId: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);