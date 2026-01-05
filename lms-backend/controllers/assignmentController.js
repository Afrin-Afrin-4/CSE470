const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const { sendGradeNotification } = require('../services/notificationService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create an assignment
// @route   POST /api/courses/:courseId/assignments
// @access  Private (Instructor/Admin)
const createAssignment = asyncHandler(async (req, res) => {
  const { lessonIndex, title, description, dueDate, maxPoints } = req.body;
  const { courseId } = req.params;

  // Check if user is the course instructor or admin
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to create assignments for this course');
  }

  const assignment = await Assignment.create({
    course: courseId,
    lessonIndex,
    title,
    description,
    dueDate,
    maxPoints: maxPoints || 100
  });

  res.status(201).json({
    success: true,
    data: assignment
  });
});

// @desc    Get all assignments for a course lesson
// @route   GET /api/courses/:courseId/assignments/lesson/:lessonIndex
// @access  Private (Enrolled Students, Instructor, Admin)
const getAssignmentsForLesson = asyncHandler(async (req, res) => {
  const { id: courseId, lessonIndex } = req.params;

  // Check if user is enrolled in the course, is the instructor, or is an admin
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const isEnrolled = course.studentsEnrolled.some(student => 
    student.toString() === req.user.id
  );
  const isCourseInstructor = course.instructor.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isEnrolled && !isCourseInstructor && !isAdmin) {
    res.status(401);
    throw new Error('Not authorized to access assignments for this course');
  }

  const assignments = await Assignment.find({ 
    course: courseId, 
    lessonIndex: parseInt(lessonIndex) 
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: assignments.length,
    data: assignments
  });
});

// @desc    Get all assignments for a course
// @route   GET /api/courses/:courseId/assignments
// @access  Private (Enrolled Students, Instructor, Admin)
const getAssignmentsForCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Check if user is enrolled in the course, is the instructor, or is an admin
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const isEnrolled = course.studentsEnrolled.some(student => 
    student.toString() === req.user.id
  );
  const isCourseInstructor = course.instructor.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isEnrolled && !isCourseInstructor && !isAdmin) {
    res.status(401);
    throw new Error('Not authorized to access assignments for this course');
  }

  const assignments = await Assignment.find({ course: courseId })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: assignments.length,
    data: assignments
  });
});

// @desc    Submit an assignment
// @route   POST /api/assignments/:assignmentId/submit
// @access  Private (Student)
const submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  
  // Check if assignment exists
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Check if user is enrolled in the course
  const course = await Course.findById(assignment.course);
  const isEnrolled = course.studentsEnrolled.some(student => 
    student.toString() === req.user.id
  );

  if (!isEnrolled) {
    res.status(401);
    throw new Error('Not authorized to submit assignment');
  }

  // Check if assignment is past due
  if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
    res.status(400);
    throw new Error('Assignment is past due');
  }

  // Check if there's already a submission
  const existingSubmission = await AssignmentSubmission.findOne({
    assignment: assignmentId,
    student: req.user.id
  });

  if (existingSubmission) {
    // Update the existing submission
    existingSubmission.fileUrl = req.body.fileUrl;
    existingSubmission.fileName = req.body.fileName;
    existingSubmission.submittedAt = Date.now();
    existingSubmission.grade = undefined; // Reset grade when resubmitting
    existingSubmission.gradedAt = undefined;
    existingSubmission.feedback = undefined;
    existingSubmission.gradedBy = undefined;
    
    const updatedSubmission = await existingSubmission.save();
    
    res.status(200).json({
      success: true,
      data: updatedSubmission
    });
  } else {
    // Create a new submission
    const submission = await AssignmentSubmission.create({
      assignment: assignmentId,
      student: req.user.id,
      fileUrl: req.body.fileUrl,
      fileName: req.body.fileName
    });

    res.status(201).json({
      success: true,
      data: submission
    });
  }
});

// @desc    Grade an assignment
// @route   PUT /api/assignments/:assignmentId/submissions/:submissionId/grade
// @access  Private (Instructor/Admin)
const gradeAssignment = asyncHandler(async (req, res) => {
  const { assignmentId, submissionId } = req.params;
  const { grade, feedback } = req.body;

  // Check if user is the course instructor or admin
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  const course = await Course.findById(assignment.course);
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to grade this assignment');
  }

  const submission = await AssignmentSubmission.findOne({
    _id: submissionId,
    assignment: assignmentId
  });

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  submission.grade = grade;
  submission.feedback = feedback;
  submission.gradedAt = Date.now();
  submission.gradedBy = req.user.id;

  await submission.save();

  // Send grade notification to the student
  await sendGradeNotification(submission.student, assignment.course, assignment.title, grade);

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Get assignment submission
// @route   GET /api/assignments/:assignmentId/submissions/:submissionId
// @access  Private (Owner, Instructor, Admin)
const getAssignmentSubmission = asyncHandler(async (req, res) => {
  const { assignmentId, submissionId } = req.params;

  const submission = await AssignmentSubmission.findOne({
    _id: submissionId,
    assignment: assignmentId
  }).populate('student', 'name email');

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // Check if user is the submission owner, course instructor, or admin
  const assignment = await Assignment.findById(assignmentId).populate('course');
  const isOwner = submission.student._id.toString() === req.user.id;
  const isCourseInstructor = assignment.course.instructor.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isCourseInstructor && !isAdmin) {
    res.status(401);
    throw new Error('Not authorized to view this submission');
  }

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Get all submissions for an assignment
// @route   GET /api/assignments/:assignmentId/submissions
// @access  Private (Instructor/Admin)
const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const assignment = await Assignment.findById(assignmentId).populate('course');
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Check if user is the course instructor or admin
  if (assignment.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to view submissions for this assignment');
  }

  const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
    .populate('student', 'name email')
    .sort({ submittedAt: -1 });

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions
  });
});

// @desc    Get user's submissions for an assignment
// @route   GET /api/assignments/:assignmentId/my-submission
// @access  Private (Student)
const getUserAssignmentSubmission = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  const submission = await AssignmentSubmission.findOne({
    assignment: assignmentId,
    student: req.user.id
  });

  res.status(200).json({
    success: true,
    data: submission
  });
});

module.exports = {
  createAssignment,
  getAssignmentsForLesson,
  getAssignmentsForCourse,
  submitAssignment,
  gradeAssignment,
  getAssignmentSubmission,
  getAssignmentSubmissions,
  getUserAssignmentSubmission
};