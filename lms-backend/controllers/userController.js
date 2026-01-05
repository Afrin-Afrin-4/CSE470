const User = require('../models/User');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get current user's enrolled courses
// @route   GET /api/users/me/courses
// @access  Private
const getMyCourses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'coursesEnrolled',
    select: 'title description thumbnail'
  });
  
  res.status(200).json({
    success: true,
    count: user.coursesEnrolled.length,
    data: user.coursesEnrolled
  });
});

module.exports = {
  getUsers,
  getUser,
  getMyCourses
};