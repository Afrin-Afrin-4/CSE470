const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  // Build query object
  let query = { isPublished: true };

  // Add search functionality
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Add level filter
  if (req.query.level) {
    query.level = req.query.level;
  }

  const courses = await Course.find(query).populate('instructor', 'name');

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name')
    .populate('studentsEnrolled', 'name');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Only allow instructors/admins to see unpublished courses
  if (!course.isPublished && req.user?.role !== 'instructor' && req.user?.role !== 'admin') {
    res.status(404);
    throw new Error('Course not found');
  }

  // For now, make course content accessible to all enrolled or non-enrolled users
  // Only restrict if needed for specific security reasons
  let courseData = course.toObject();

  // For now, allow all users to see full lesson details for better UX
  // Original restriction code is commented out
  // if (req.user) {
  //   // Check if user is enrolled or is the instructor
  //   const isEnrolled = course.studentsEnrolled.some(studentId => 
  //     studentId.toString() === req.user.id
  //   );
  //   
  //   const isCourseInstructor = course.instructor.toString() === req.user.id;
  //   
  //   if (!isEnrolled && !isCourseInstructor && req.user.role !== 'admin') {
  //     // Filter out sensitive lesson details for non-authorized users
  //     if (courseData.lessons) {
  //       courseData.lessons = courseData.lessons.map(lesson => ({
  //         _id: lesson._id,
  //         title: lesson.title,
  //         description: lesson.description,
  //         duration: lesson.duration
  //         // Don't include videoUrl or other content details
  //       }));
  //     }
  //   }
  // } else {
  //   // For non-logged-in users, filter out sensitive lesson details
  //   if (courseData.lessons) {
  //     courseData.lessons = courseData.lessons.map(lesson => ({
  //       _id: lesson._id,
  //       title: lesson.title,
  //       description: lesson.description,
  //       duration: lesson.duration
  //       // Don't include videoUrl or other content details
  //     }));
  //   }
  // }

  res.status(200).json({
    success: true,
    data: courseData
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
const createCourse = asyncHandler(async (req, res) => {
  req.body.instructor = req.user.id;

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if user is course instructor or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this course');
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if user is course instructor or admin
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this course');
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Enroll in course
// @route   PUT /api/courses/:id/enroll
// @access  Private
const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if already enrolled
  if (course.studentsEnrolled.includes(req.user.id)) {
    res.status(400);
    throw new Error('Already enrolled in this course');
  }

  // For now, make all courses free - check if course requires payment
  // if (course.price > 0) {
  //   // For paid courses, check if user has made a successful payment
  //   const Payment = require('../models/Payment');
  //   const payment = await Payment.findOne({
  //     student: req.user.id,
  //     course: req.params.id,
  //     status: 'completed'
  //   });
  //   
  //   if (!payment) {
  //     res.status(402); // Payment Required
  //     throw new Error('Payment required to enroll in this course');
  //   }
  // }

  // Add user to course using updateOne to avoid validation issues
  await Course.updateOne(
    { _id: req.params.id },
    { $push: { studentsEnrolled: req.user.id } }
  );

  // Add course to user
  await User.updateOne(
    { _id: req.user.id },
    { $push: { coursesEnrolled: req.params.id } }
  );

  // Fetch updated course to return
  const updatedCourse = await Course.findById(req.params.id)
    .populate('instructor', 'name')
    .populate('studentsEnrolled', 'name');

  res.status(200).json({
    success: true,
    data: updatedCourse
  });
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse
};