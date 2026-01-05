const Progress = require('../models/Progress');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get student progress for a course
// @route   GET /api/progress/:courseId
// @access  Private
const getProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({
    user: req.user.id,
    course: req.params.courseId
  });

  if (!progress) {
    // Get course to determine total lessons
    const course = await Course.findById(req.params.courseId);
    const totalLessons = course ? course.lessons.length : 0;

    return res.status(200).json({
      success: true,
      data: {
        overallProgress: 0,
        completionPercentage: 0,
        completedLessons: [],
        totalLessons: totalLessons,
        lessonsCompleted: []
      }
    });
  }

  // Calculate completion percentage if not available
  const course = await Course.findById(req.params.courseId);
  const totalLessons = course ? course.lessons.length : 0;
  const completedLessons = progress.lessonsCompleted.length;
  const completionPercentage = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      ...progress.toObject(),
      completionPercentage: completionPercentage,
      completedLessons: progress.lessonsCompleted.map(lesson => lesson.lessonId.toString())
    }
  });
});

// @desc    Update lesson completion status
// @route   PUT /api/progress/:courseId/lessons/:lessonId
// @access  Private
const updateLessonProgress = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;

  // Verify the course and lesson exist
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const lessonExists = course.lessons.some(lesson => lesson._id.toString() === lessonId);
  if (!lessonExists) {
    res.status(404);
    throw new Error('Lesson not found in this course');
  }

  // Find or create progress record
  let progress = await Progress.findOne({
    user: req.user.id,
    course: courseId
  });

  if (!progress) {
    progress = await Progress.create({
      user: req.user.id,
      course: courseId,
      lessonsCompleted: []
    });
  }

  // Update lesson completion
  const lessonIndex = progress.lessonsCompleted.findIndex(
    item => item.lessonId.toString() === lessonId
  );

  if (lessonIndex === -1) {
    // Add completed lesson
    progress.lessonsCompleted.push({
      lessonId: lessonId,
      completedAt: Date.now()
    });
  } else {
    // Remove completed lesson (toggle off)
    progress.lessonsCompleted.splice(lessonIndex, 1);
  }

  // Calculate overall progress
  const totalLessons = course.lessons.length;
  const completedLessons = progress.lessonsCompleted.length;
  progress.overallProgress = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  // Set completion date if all lessons are completed
  if (completedLessons === totalLessons && totalLessons > 0) {
    progress.completedAt = Date.now();

    // AWARD BADGE LOGIC
    try {
      const User = require('../models/User');
      const Badge = require('../models/Badge');

      // 1. Check if user already has a badge for this course
      const user = await User.findById(req.user.id);
      const hasBadge = user.badges.some(b => b.course.toString() === courseId);

      if (!hasBadge) {
        // 2. Find the "Course Completion" badge or create a default one
        let completionBadge = await Badge.findOne({ name: 'Course Completion' });

        if (!completionBadge) {
          completionBadge = await Badge.create({
            name: 'Course Completion',
            description: 'Awarded for completing all lessons in a course',
            icon: '🏆',
            criteria: 'Complete 100% of course lessons'
          });
        }

        // 3. Award badge and add points
        user.badges.push({
          badge: completionBadge._id,
          course: courseId
        });

        // Add badge points to user's total
        user.badgePoints = (user.badgePoints || 0) + (completionBadge.points || 10);

        await user.save();
      }
    } catch (err) {
      console.error('Error awarding badge:', err);
      // Continue execution, don't fail the progress update
    }
  } else {
    progress.completedAt = undefined;
  }

  // Update last accessed
  progress.lastAccessed = Date.now();

  await progress.save();

  res.status(200).json({
    success: true,
    data: {
      ...progress.toObject(),
      completionPercentage: progress.overallProgress,
      completedLessons: progress.lessonsCompleted.map(lesson => lesson.lessonId.toString())
    }
  });
});

// @desc    Get all progress for a student
// @route   GET /api/progress
// @access  Private
const getAllProgress = asyncHandler(async (req, res) => {
  const progressRecords = await Progress.find({ user: req.user.id })
    .populate('course', 'title description thumbnail');

  // Calculate completion percentage for each record
  const enhancedProgress = await Promise.all(progressRecords.map(async (record) => {
    const course = await Course.findById(record.course._id);
    const totalLessons = course && course.lessons ? course.lessons.length : 0;
    const completedLessons = record.lessonsCompleted.length;
    const completionPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    return {
      ...record.toObject(),
      completionPercentage,
      completedLessons: record.lessonsCompleted.map(lesson => lesson.lessonId.toString())
    };
  }));

  res.status(200).json({
    success: true,
    count: enhancedProgress.length,
    data: enhancedProgress
  });
});

// @desc    Get all progress (Admin)
// @route   GET /api/progress/admin/all
// @access  Private (Admin)
const getAllGlobalProgress = asyncHandler(async (req, res) => {
  const progressRecords = await Progress.find()
    .populate('user', 'name email')
    .populate('course', 'title');

  // Calculate completion percentage for each record
  const enhancedProgress = await Promise.all(progressRecords.map(async (record) => {
    // Handling case where course might be null (deleted)
    if (!record.course) return null;

    const course = await Course.findById(record.course._id);
    const totalLessons = course && course.lessons ? course.lessons.length : 0;
    const completedLessons = record.lessonsCompleted.length;
    const completionPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    return {
      ...record.toObject(),
      completionPercentage,
      studentName: record.user?.name || 'Unknown',
      courseTitle: record.course.title
    };
  }));

  // Filter out nulls
  const validProgress = enhancedProgress.filter(p => p !== null);

  res.status(200).json({
    success: true,
    count: validProgress.length,
    data: validProgress
  });
});

module.exports = {
  getProgress,
  updateLessonProgress,
  getAllProgress,
  getAllGlobalProgress
};