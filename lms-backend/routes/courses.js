const express = require('express');
const { 
  getCourses, 
  getCourse, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  enrollInCourse
} = require('../controllers/courseController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Include reviews router
const reviewsRouter = require('./reviews');
router.use('/:id/reviews', reviewsRouter);

// Include announcements router
const announcementsRouter = require('./announcements');
router.use('/:id/announcements', announcementsRouter);

// Include certificates router
const certificatesRouter = require('./certificates');
router.use('/:id/certificates', certificatesRouter);

// Include quizzes router
const quizzesRouter = require('./quizzes');
router.use('/:id/quizzes', quizzesRouter);

// Include assignments router
const assignmentsRouter = require('./assignments');
router.use('/:id/assignments', assignmentsRouter);

// Include discussions router
const discussionsRouter = require('./discussions');
router.use('/:id/discussions', discussionsRouter);

router.route('/')
  .get(getCourses)
  .post(protect, authorize('instructor', 'admin'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('instructor', 'admin'), updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

router.put('/:id/enroll', protect, enrollInCourse);

module.exports = router;