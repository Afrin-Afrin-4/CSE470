const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Mark attendance for a student
// @route   POST /api/attendance/mark
// @access  Private (Instructor/Admin)
const markAttendance = asyncHandler(async (req, res) => {
  const { courseId, studentId, session, date, status, notes } = req.body;
  
  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  // Check if user is instructor of this course or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to mark attendance for this course');
  }
  
  // Verify student exists and is enrolled in the course
  const student = await User.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  
  if (!course.studentsEnrolled.includes(studentId)) {
    res.status(400);
    throw new Error('Student is not enrolled in this course');
  }
  
  // Check if attendance already exists for this student, course, session, and date
  const existingAttendance = await Attendance.findOne({
    student: studentId,
    course: courseId,
    session,
    date: new Date(date)
  });
  
  let attendance;
  if (existingAttendance) {
    // Update existing attendance
    attendance = await Attendance.findByIdAndUpdate(
      existingAttendance._id,
      { status, notes },
      { new: true, runValidators: true }
    );
  } else {
    // Create new attendance record
    attendance = await Attendance.create({
      student: studentId,
      course: courseId,
      session,
      date: new Date(date),
      status,
      notes
    });
  }
  
  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Get attendance records for a course
// @route   GET /api/attendance/course/:courseId
// @access  Private (Instructor/Admin/Student)
const getCourseAttendance = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  // Check permissions
  let query = { course: courseId };
  
  // If student, only get their own attendance
  if (req.user.role === 'student') {
    query.student = req.user.id;
  }
  // If instructor, check if they teach this course
  else if (req.user.role === 'instructor') {
    if (course.instructor.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to view attendance for this course');
    }
  }
  // Admin can view all
  
  const attendance = await Attendance.find(query)
    .populate('student', 'name email')
    .sort({ date: -1, session: 1 });
  
  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance
  });
});

// @desc    Get attendance records for a student in a course
// @route   GET /api/attendance/course/:courseId/student/:studentId
// @access  Private (Instructor/Admin/Student)
const getStudentAttendance = asyncHandler(async (req, res) => {
  const { courseId, studentId } = req.params;
  
  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  // Verify student exists
  const student = await User.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  
  // Check permissions
  // Students can only view their own attendance
  if (req.user.role === 'student' && req.user.id !== studentId) {
    res.status(401);
    throw new Error('Not authorized to view this student\'s attendance');
  }
  
  // Instructors can only view attendance for students in their courses
  if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to view attendance for this course');
  }
  
  // Check if student is enrolled in the course
  if (!course.studentsEnrolled.includes(studentId)) {
    res.status(400);
    throw new Error('Student is not enrolled in this course');
  }
  
  const attendance = await Attendance.find({
    student: studentId,
    course: courseId
  }).sort({ date: -1, session: 1 });
  
  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance
  });
});

// @desc    Get attendance summary for a student in a course
// @route   GET /api/attendance/course/:courseId/student/:studentId/summary
// @access  Private (Instructor/Admin/Student)
const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { courseId, studentId } = req.params;
  
  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  // Verify student exists
  const student = await User.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  
  // Check permissions
  // Students can only view their own attendance
  if (req.user.role === 'student' && req.user.id !== studentId) {
    res.status(401);
    throw new Error('Not authorized to view this student\'s attendance');
  }
  
  // Instructors can only view attendance for students in their courses
  if (req.user.role === 'instructor' && course.instructor.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to view attendance for this course');
  }
  
  // Check if student is enrolled in the course
  if (!course.studentsEnrolled.includes(studentId)) {
    res.status(400);
    throw new Error('Student is not enrolled in this course');
  }
  
  // Get all attendance records for this student in this course
  const attendanceRecords = await Attendance.find({
    student: studentId,
    course: courseId
  });
  
  // Calculate summary
  const totalSessions = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
  const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
  const lateCount = attendanceRecords.filter(a => a.status === 'late').length;
  
  const attendancePercentage = totalSessions > 0 
    ? Math.round((presentCount / totalSessions) * 100)
    : 0;
  
  res.status(200).json({
    success: true,
    data: {
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      attendancePercentage
    }
  });
});

module.exports = {
  markAttendance,
  getCourseAttendance,
  getStudentAttendance,
  getAttendanceSummary
};