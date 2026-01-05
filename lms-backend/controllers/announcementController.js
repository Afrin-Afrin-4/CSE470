const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const { sendAnnouncementNotification } = require('../services/notificationService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create an announcement for a course
// @route   POST /api/courses/:courseId/announcements
// @access  Private (Instructor/Admin)
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  const courseId = req.params.courseId || req.params.id;

  // Check if course exists and user is instructor
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if user is the course instructor or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to create announcements for this course');
  }

  const announcement = await Announcement.create({
    course: courseId,
    instructor: req.user.id,
    title,
    message
  });

  // Send notification to all enrolled students
  await sendAnnouncementNotification(courseId, title);

  res.status(201).json({
    success: true,
    data: announcement
  });
});

// @desc    Get all announcements for a course
// @route   GET /api/courses/:courseId/announcements
// @access  Private (Enrolled Students, Instructor, Admin)
const getAnnouncementsForCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId || req.params.id;

  // Check if user is enrolled in the course, is the instructor, or is an admin
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check authorization
  const isEnrolled = course.studentsEnrolled.some(student =>
    student.toString() === req.user.id
  );
  const isCourseInstructor = course.instructor.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isEnrolled && !isCourseInstructor && !isAdmin) {
    res.status(401);
    throw new Error('Not authorized to view announcements for this course');
  }

  const announcements = await Announcement.find({ course: courseId })
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: announcements.length,
    data: announcements
  });
});

// @desc    Update an announcement
// @route   PUT /api/courses/:courseId/announcements/:announcementId
// @access  Private (Instructor/Admin - own announcement only)
const updateAnnouncement = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  const { courseId, announcementId } = req.params;

  const announcement = await Announcement.findOne({
    _id: announcementId,
    course: courseId,
    instructor: req.user.id
  });

  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  // Only allow updating if user is the instructor of the announcement or admin
  if (announcement.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this announcement');
  }

  announcement.title = title || announcement.title;
  announcement.message = message || announcement.message;

  await announcement.save();

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Delete an announcement
// @route   DELETE /api/courses/:courseId/announcements/:announcementId
// @access  Private (Instructor/Admin - own announcement only)
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { courseId, announcementId } = req.params;

  const announcement = await Announcement.findOne({
    _id: announcementId,
    course: courseId
  });

  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  // Check if user is the instructor of the announcement or admin
  if (announcement.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this announcement');
  }

  await announcement.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = {
  createAnnouncement,
  getAnnouncementsForCourse,
  updateAnnouncement,
  deleteAnnouncement
};