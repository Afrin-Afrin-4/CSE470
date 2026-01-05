const express = require('express');
const { 
  createAssignment,
  getAssignmentsForLesson,
  getAssignmentsForCourse,
  submitAssignment,
  gradeAssignment,
  getAssignmentSubmission,
  getAssignmentSubmissions,
  getUserAssignmentSubmission
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Route for creating assignments for a specific course
router.route('/')
  .post(protect, authorize('instructor', 'admin'), createAssignment)
  .get(protect, getAssignmentsForCourse);

// Route for getting assignments for a specific lesson in a course
router.route('/lesson/:lessonIndex')
  .get(protect, getAssignmentsForLesson);

// Route for submitting assignments
router.route('/:assignmentId/submit')
  .post(protect, submitAssignment);

// Route for getting user's submission for an assignment
router.route('/:assignmentId/my-submission')
  .get(protect, getUserAssignmentSubmission);

// Route for grading assignments (for instructors/admins)
router.route('/:assignmentId/submissions/:submissionId/grade')
  .put(protect, authorize('instructor', 'admin'), gradeAssignment);

// Route for getting assignment submissions
router.route('/:assignmentId/submissions/:submissionId')
  .get(protect, getAssignmentSubmission);

// Route for getting all submissions for an assignment
router.route('/:assignmentId/submissions')
  .get(protect, authorize('instructor', 'admin'), getAssignmentSubmissions);

module.exports = router;