const express = require('express');
const { 
  getSubmissionsByCourse,
  getStudentSubmissions,
  submitAssignment,
  gradeSubmission,
  getMyGrades
} = require('../controllers/submissionController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(submitAssignment);

router.route('/course/:courseId')
  .get(getSubmissionsByCourse);

router.route('/course/:courseId/student/:studentId')
  .get(getStudentSubmissions);

router.route('/:id/grade')
  .put(gradeSubmission);

router.route('/my-grades/:courseId')
  .get(getMyGrades);

module.exports = router;