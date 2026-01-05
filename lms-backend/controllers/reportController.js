const User = require('../models/User');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get system overview report
// @route   GET /api/reports/overview
// @access  Private (Admin)
const getSystemOverview = asyncHandler(async (req, res) => {
  // Get counts
  const userCount = await User.countDocuments();
  const courseCount = await Course.countDocuments();
  const publishedCourseCount = await Course.countDocuments({ isPublished: true });
  const submissionCount = await Submission.countDocuments();
  
  // Get user roles distribution
  const userRoles = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  const recentCourses = await Course.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  const recentSubmissions = await Submission.countDocuments({
    submittedAt: { $gte: thirtyDaysAgo }
  });
  
  res.status(200).json({
    success: true,
    data: {
      totals: {
        users: userCount,
        courses: courseCount,
        publishedCourses: publishedCourseCount,
        submissions: submissionCount
      },
      userRoles,
      recentActivity: {
        users: recentUsers,
        courses: recentCourses,
        submissions: recentSubmissions
      }
    }
  });
});

// @desc    Get course performance report
// @route   GET /api/reports/courses
// @access  Private (Admin)
const getCoursePerformance = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate('instructor', 'name')
    .lean();
  
  // Add enrollment counts and calculate performance metrics
  const courseData = await Promise.all(courses.map(async (course) => {
    const enrollmentCount = course.studentsEnrolled ? course.studentsEnrolled.length : 0;
    
    // Get average grades for this course
    const submissions = await Submission.find({ course: course._id, grade: { $exists: true } });
    const averageGrade = submissions.length > 0 
      ? submissions.reduce((sum, sub) => sum + sub.grade, 0) / submissions.length
      : 0;
    
    return {
      ...course,
      enrollmentCount,
      averageGrade: Math.round(averageGrade * 100) / 100,
      revenue: course.price * enrollmentCount
    };
  }));
  
  res.status(200).json({
    success: true,
    count: courseData.length,
    data: courseData
  });
});

// @desc    Get user activity report
// @route   GET /api/reports/users
// @access  Private (Admin)
const getUserActivity = asyncHandler(async (req, res) => {
  const users = await User.find().select('name email role createdAt');
  
  // Add enrollment and submission counts for each user
  const userData = await Promise.all(users.map(async (user) => {
    // Count enrolled courses
    const enrolledCourses = await Course.countDocuments({
      studentsEnrolled: user._id
    });
    
    // Count submissions
    const submissionCount = await Submission.countDocuments({
      student: user._id
    });
    
    // Count courses taught (for instructors)
    const coursesTaught = await Course.countDocuments({
      instructor: user._id
    });
    
    return {
      ...user.toObject(),
      enrolledCourses,
      submissions: submissionCount,
      coursesTaught
    };
  }));
  
  res.status(200).json({
    success: true,
    count: userData.length,
    data: userData
  });
});

// @desc    Get financial report
// @route   GET /api/reports/financial
// @access  Private (Admin)
const getFinancialReport = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isPublished: true });
  
  let totalRevenue = 0;
  let totalFreeCourses = 0;
  let totalPaidCourses = 0;
  
  const courseRevenue = await Promise.all(courses.map(async (course) => {
    const enrollmentCount = course.studentsEnrolled ? course.studentsEnrolled.length : 0;
    const revenue = course.price * enrollmentCount;
    totalRevenue += revenue;
    
    if (course.price > 0) {
      totalPaidCourses++;
    } else {
      totalFreeCourses++;
    }
    
    return {
      title: course.title,
      price: course.price,
      enrollmentCount,
      revenue
    };
  }));
  
  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      totalFreeCourses,
      totalPaidCourses,
      courseRevenue
    }
  });
});

module.exports = {
  getSystemOverview,
  getCoursePerformance,
  getUserActivity,
  getFinancialReport
};