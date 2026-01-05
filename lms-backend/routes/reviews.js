const express = require('express');
const { 
  createReview, 
  getReviewsForCourse, 
  updateReview, 
  deleteReview 
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Route for creating and getting reviews for a specific course
router.route('/')
  .post(protect, createReview)
  .get(getReviewsForCourse);

// Route for updating and deleting a specific review
router.route('/:reviewId')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;