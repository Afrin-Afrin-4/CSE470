const Submission = require('../models/Submission');
const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all submissions for a course
// @route   GET /api/submissions/course/:courseId
// @access  Private (Instructor/Admin)
const getSubmissionsByCourse = asyncHandler(async (req, res) => {
  // Check if user is instructor of this course or admin
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to view submissions for this course');
  }
  
  const submissions = await Submission.find({ course: req.params.courseId })
    .populate('student', 'name email')
    .populate('gradedBy', 'name');
  
  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions
  });
});

// @desc    Get submissions for a specific student in a course
// @route   GET /api/submissions/course/:courseId/student/:studentId
// @access  Private (Student/Instructor/Admin)
const getStudentSubmissions = asyncHandler(async (req, res) => {
  // Check if user is the student, instructor of the course, or admin
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  if (req.user.role !== 'admin' && 
      req.user.id !== req.params.studentId && 
      course.instructor.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to view these submissions');
  }
  
  const submissions = await Submission.find({
    course: req.params.courseId,
    student: req.params.studentId
  }).populate('gradedBy', 'name');
  
  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions
  });
});

// @desc    Submit an assignment
// @route   POST /api/submissions
// @access  Private (Student)
const submitAssignment = asyncHandler(async (req, res) => {
  const { courseId, assignment, submissionText, submissionFile } = req.body;
  
  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  // Check if student is enrolled in the course
  if (!course.studentsEnrolled.includes(req.user.id)) {
    res.status(401);
    throw new Error('You must be enrolled in this course to submit assignments');
  }
  
  // Check if submission already exists for this student, course, and assignment
  const existingSubmission = await Submission.findOne({
    student: req.user.id,
    course: courseId,
    assignment: assignment
  });
  
  if (existingSubmission) {
    res.status(400);
    throw new Error('You have already submitted this assignment');
  }
  
  const submission = await Submission.create({
    student: req.user.id,
    course: courseId,
    assignment,
    submissionText,
    submissionFile
  });
  
  res.status(201).json({
    success: true,
    data: submission
  });
});

// @desc    Grade a submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Instructor/Admin)
const gradeSubmission = asyncHandler(async (req, res) => {
  const { grade, feedback } = req.body;
  
  // Validate grade
  if (grade < 0 || grade > 100) {
    res.status(400);
    throw new Error('Grade must be between 0 and 100');
  }
  
  let submission = await Submission.findById(req.params.id);
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }
  
  // Check if user is instructor of this course or admin
  const course = await Course.findById(submission.course);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to grade submissions for this course');
  }
  
  submission = await Submission.findByIdAndUpdate(
    req.params.id,
    {
      grade,
      feedback,
      gradedBy: req.user.id,
      gradedAt: Date.now()
    },
    {
      new: true,
      runValidators: true
    }
  ).populate('student', 'name email')
   .populate('gradedBy', 'name');
  
  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Get student's grades for a course
// @route   GET /api/submissions/my-grades/:courseId
// @access  Private (Student)
const getMyGrades = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({
    student: req.user.id,
    course: req.params.courseId
  }).select('assignment grade submittedAt gradedAt feedback');
  
  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions
  });
});

module.exports = {
  getSubmissionsByCourse,
  getStudentSubmissions,
  submitAssignment,
  gradeSubmission,
  getMyGrades
};