const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', CategorySchema);