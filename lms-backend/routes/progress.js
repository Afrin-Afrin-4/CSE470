const express = require('express');
const {
  getProgress,
  updateLessonProgress,
  getAllProgress,
  getAllGlobalProgress
} = require('../controllers/progressController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAllProgress);

router.route('/admin/all')
  .get(authorize('admin'), getAllGlobalProgress);

router.route('/:courseId')
  .get(getProgress);

router.route('/:courseId/lessons/:lessonId')
  .put(updateLessonProgress);

module.exports = router;