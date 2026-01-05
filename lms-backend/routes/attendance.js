const express = require('express');
const { 
  markAttendance,
  getCourseAttendance,
  getStudentAttendance,
  getAttendanceSummary
} = require('../controllers/attendanceController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/mark')
  .post(markAttendance);

router.route('/course/:courseId')
  .get(getCourseAttendance);

router.route('/course/:courseId/student/:studentId')
  .get(getStudentAttendance);

router.route('/course/:courseId/student/:studentId/summary')
  .get(getAttendanceSummary);

module.exports = router;