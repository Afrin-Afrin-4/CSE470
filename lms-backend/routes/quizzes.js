const express = require('express');
const { 
  createQuiz,
  getQuiz,
  getQuizzesForLesson,
  submitQuizAttempt,
  getQuizAttempt,
  getQuizAttempts,
  getUserQuizAttempts
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Route for creating quizzes for a specific course
router.route('/')
  .post(protect, authorize('instructor', 'admin'), createQuiz);

// Route for getting a specific quiz
router.route('/:quizId')
  .get(protect, getQuiz);

// Route for getting quizzes for a specific lesson in a course
router.route('/lesson/:lessonIndex')
  .get(protect, getQuizzesForLesson);

// Route for submitting quiz attempts
router.route('/:quizId/attempt')
  .post(protect, submitQuizAttempt);

// Route for getting quiz attempts
router.route('/:quizId/attempts/:attemptId')
  .get(protect, getQuizAttempt);

// Route for getting all attempts for a quiz (for instructors/admins)
router.route('/:quizId/attempts')
  .get(protect, authorize('instructor', 'admin'), getQuizAttempts);

// Route for getting user's attempts for a quiz
router.route('/:quizId/my-attempts')
  .get(protect, getUserQuizAttempts);

module.exports = router;