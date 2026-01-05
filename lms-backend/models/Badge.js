const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  icon: {
    type: String,
    required: [true, 'Please add an icon']
  },
  criteria: {
    type: String,
    required: [true, 'Please add criteria for earning this badge']
  },
  points: {
    type: Number,
    default: 10 // Default points awarded when this badge is earned
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Badge', BadgeSchema);