const asyncHandler = require('../middleware/async');
const Badge = require('../models/Badge');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc      Get all badges
// @route     GET /api/badges
// @access    Public
exports.getBadges = asyncHandler(async (req, res, next) => {
  const badges = await Badge.find();

  res.status(200).json({
    success: true,
    count: badges.length,
    data: badges
  });
});

// @desc      Get single badge
// @route     GET /api/badges/:id
// @access    Public
exports.getBadge = asyncHandler(async (req, res, next) => {
  const badge = await Badge.findById(req.params.id);

  if (!badge) {
    return next(
      new ErrorResponse(`No badge with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: badge
  });
});

// @desc      Create new badge
// @route     POST /api/badges
// @access    Private/Admin
exports.createBadge = asyncHandler(async (req, res, next) => {
  const badge = await Badge.create(req.body);

  res.status(201).json({
    success: true,
    data: badge
  });
});

// @desc      Update badge
// @route     PUT /api/badges/:id
// @access    Private/Admin
exports.updateBadge = asyncHandler(async (req, res, next) => {
  let badge = await Badge.findById(req.params.id);

  if (!badge) {
    return next(
      new ErrorResponse(`No badge with the id of ${req.params.id}`, 404)
    );
  }

  badge = await Badge.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: badge
  });
});

// @desc      Delete badge
// @route     DELETE /api/badges/:id
// @access    Private/Admin
exports.deleteBadge = asyncHandler(async (req, res, next) => {
  const badge = await Badge.findById(req.params.id);

  if (!badge) {
    return next(
      new ErrorResponse(`No badge with the id of ${req.params.id}`, 404)
    );
  }

  await badge.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get user's achievements
// @route     GET /api/users/:userId/achievements
// @access    Private
exports.getUserAchievements = asyncHandler(async (req, res, next) => {
  const achievements = await Achievement.find({ user: req.params.userId })
    .populate('badge', 'name description icon')
    .populate('course', 'title');

  res.status(200).json({
    success: true,
    count: achievements.length,
    data: achievements
  });
});

// @desc      Award badge to user
// @route     POST /api/users/:userId/badges/:badgeId
// @access    Private/Admin
exports.awardBadge = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  const badge = await Badge.findById(req.params.badgeId);

  if (!user) {
    return next(
      new ErrorResponse(`No user with the id of ${req.params.userId}`, 404)
    );
  }

  if (!badge) {
    return next(
      new ErrorResponse(`No badge with the id of ${req.params.badgeId}`, 404)
    );
  }

  // Check if user already has this badge
  const existingAchievement = await Achievement.findOne({
    user: req.params.userId,
    badge: req.params.badgeId
  });

  if (existingAchievement) {
    return next(
      new ErrorResponse(`User already has this badge`, 400)
    );
  }

  const achievement = await Achievement.create({
    user: req.params.userId,
    badge: req.params.badgeId
  });

  res.status(201).json({
    success: true,
    data: achievement
  });
});