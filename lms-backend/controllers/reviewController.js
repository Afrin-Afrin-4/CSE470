const Review = require('../models/Review');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create a review for a course
// @route   POST /api/courses/:courseId/reviews
// @access  Private (Student)
const createReview = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;
  const { courseId } = req.params;

  // Check if user is enrolled in the course
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  const isEnrolled = course.studentsEnrolled.some(studentId => 
    studentId.toString() === req.user.id
  );
  
  if (!isEnrolled) {
    res.status(401);
    throw new Error('You must be enrolled in this course to review it');
  }

  // Check if user has already reviewed this course
  const existingReview = await Review.findOne({
    course: courseId,
    user: req.user.id
  });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this course');
  }

  // Create the review
  const reviewDoc = await Review.create({
    course: courseId,
    user: req.user.id,
    rating,
    review
  });

  // Calculate new average rating
  const reviews = await Review.find({ course: courseId });
  const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;
  
  // Update course with new average rating and count
  await Course.findByIdAndUpdate(courseId, {
    ratingsAverage: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
    ratingsQuantity: reviews.length
  });

  res.status(201).json({
    success: true,
    data: reviewDoc
  });
});

// @desc    Get all reviews for a course
// @route   GET /api/courses/:courseId/reviews
// @access  Public
const getReviewsForCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const reviews = await Review.find({ course: courseId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Update a review
// @route   PUT /api/courses/:courseId/reviews/:reviewId
// @access  Private (Student - own review only)
const updateReview = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;
  const { courseId, reviewId } = req.params;

  const reviewDoc = await Review.findOne({ 
    _id: reviewId, 
    course: courseId,
    user: req.user.id 
  });

  if (!reviewDoc) {
    res.status(404);
    throw new Error('Review not found');
  }

  reviewDoc.rating = rating || reviewDoc.rating;
  reviewDoc.review = review || reviewDoc.review;

  await reviewDoc.save();

  // Recalculate average rating
  const reviews = await Review.find({ course: courseId });
  const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;
  
  // Update course with new average rating and count
  await Course.findByIdAndUpdate(courseId, {
    ratingsAverage: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
    ratingsQuantity: reviews.length
  });

  res.status(200).json({
    success: true,
    data: reviewDoc
  });
});

// @desc    Delete a review
// @route   DELETE /api/courses/:courseId/reviews/:reviewId
// @access  Private (Student - own review only, Admin)
const deleteReview = asyncHandler(async (req, res) => {
  const { courseId, reviewId } = req.params;

  const reviewDoc = await Review.findOne({ 
    _id: reviewId, 
    course: courseId 
  });

  if (!reviewDoc) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user is the owner of the review or an admin
  if (reviewDoc.user.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this review');
  }

  await reviewDoc.remove();

  // Recalculate average rating
  const reviews = await Review.find({ course: courseId });
  const avgRating = reviews.length > 0 
    ? reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length 
    : 0;
  
  // Update course with new average rating and count
  await Course.findByIdAndUpdate(courseId, {
    ratingsAverage: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
    ratingsQuantity: reviews.length
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  createReview,
  getReviewsForCourse,
  updateReview,
  deleteReview
};