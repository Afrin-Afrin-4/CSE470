const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  videoUrl: String,
  duration: String,
  attachments: [{
    name: String,
    url: String
  }]
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  slug: {
    type: String,
    unique: true
  },
  price: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String
  },
  lessons: [lessonSchema],
  duration: {
    type: String
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  studentsEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  ratingsAverage: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be above 0'],
    max: [5, 'Rating must be below 5']
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to generate slug from title
courseSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

// Virtual for reviews
courseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'course'
});

module.exports = mongoose.model('Course', courseSchema);
