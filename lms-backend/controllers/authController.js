const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, username, email, password, role } = req.body;

  // Security check: Only allow 'student' or 'instructor' roles for public registration
  if (role === 'admin') {
    res.status(400);
    throw new Error('Admin role cannot be self-assigned. Contact system administrator.');
  }

  // Check if user exists
  const userExists = await User.findOne({
    $or: [
      { email },
      { username }
    ]
  });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    username,
    email,
    password,
    role: role || 'student' // Default to student if no role provided
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      badgePoints: user.badgePoints,
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Check for user by email or username
  const user = await User.findOne({
    $or: [
      { email: email },
      { username: username }
    ]
  }).select('+password');

  if (user && (await user.comparePassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      badgePoints: user.badgePoints,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    username: req.user.username,
    role: req.user.role,
    badgePoints: req.user.badgePoints
  });
});

module.exports = {
  register,
  login,
  getMe
};