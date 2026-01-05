const asyncHandler = require('../middleware/async');
const Discussion = require('../models/Discussion');
const Course = require('../models/Course');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc      Get all discussions for a course
// @route     GET /api/courses/:courseId/discussions
// @access    Private
exports.getDiscussions = asyncHandler(async (req, res, next) => {
  const discussions = await Discussion.find({ course: req.params.courseId })
    .populate('user', 'name email')
    .populate('replies.user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: discussions.length,
    data: discussions
  });
});

// @desc      Get single discussion
// @route     GET /api/discussions/:id
// @access    Private
exports.getDiscussion = asyncHandler(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.id)
    .populate('user', 'name email')
    .populate('replies.user', 'name email');

  if (!discussion) {
    return next(
      new ErrorResponse(`No discussion with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: discussion
  });
});

// @desc      Create new discussion
// @route     POST /api/courses/:courseId/discussions
// @access    Private
exports.createDiscussion = asyncHandler(async (req, res, next) => {
  req.body.course = req.params.courseId;
  req.body.user = req.user.id;

  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.courseId}`, 404)
    );
  }

  const discussion = await Discussion.create(req.body);

  res.status(201).json({
    success: true,
    data: discussion
  });
});

// @desc      Update discussion
// @route     PUT /api/discussions/:id
// @access    Private
exports.updateDiscussion = asyncHandler(async (req, res, next) => {
  let discussion = await Discussion.findById(req.params.id);

  if (!discussion) {
    return next(
      new ErrorResponse(`No discussion with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the discussion owner
  if (discussion.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this discussion`,
        401
      )
    );
  }

  discussion = await Discussion.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: discussion
  });
});

// @desc      Delete discussion
// @route     DELETE /api/discussions/:id
// @access    Private
exports.deleteDiscussion = asyncHandler(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.id);

  if (!discussion) {
    return next(
      new ErrorResponse(`No discussion with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the discussion owner
  if (discussion.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this discussion`,
        401
      )
    );
  }

  await discussion.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Add reply to discussion
// @route     PUT /api/discussions/:id/reply
// @access    Private
exports.addReply = asyncHandler(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.id);

  if (!discussion) {
    return next(
      new ErrorResponse(`No discussion with the id of ${req.params.id}`, 404)
    );
  }

  // Add reply to replies array
  const reply = {
    user: req.user.id,
    content: req.body.content
  };

  discussion.replies.unshift(reply);

  await discussion.save();

  res.status(200).json({
    success: true,
    data: discussion
  });
});

// @desc      Delete reply from discussion
// @route     DELETE /api/discussions/:id/reply/:replyId
// @access    Private
exports.deleteReply = asyncHandler(async (req, res, next) => {
  const discussion = await Discussion.findById(req.params.id);

  if (!discussion) {
    return next(
      new ErrorResponse(`No discussion with the id of ${req.params.id}`, 404)
    );
  }

  // Find reply to remove
  const replyIndex = discussion.replies.findIndex(
    reply => reply._id.toString() === req.params.replyId
  );

  if (replyIndex === -1) {
    return next(
      new ErrorResponse(`No reply with the id of ${req.params.replyId}`, 404)
    );
  }

  // Make sure user is the reply owner or admin
  if (
    discussion.replies[replyIndex].user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this reply`,
        401
      )
    );
  }

  // Remove reply
  discussion.replies.splice(replyIndex, 1);

  await discussion.save();

  res.status(200).json({
    success: true,
    data: discussion
  });
});