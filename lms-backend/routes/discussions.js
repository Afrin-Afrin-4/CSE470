const express = require('express');
const { 
  getDiscussions, 
  getDiscussion, 
  createDiscussion, 
  updateDiscussion, 
  deleteDiscussion,
  addReply,
  deleteReply
} = require('../controllers/discussionController');

const router = express.Router({ mergeParams: true });

const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getDiscussions)
  .post(protect, createDiscussion);

router
  .route('/:id')
  .get(protect, getDiscussion)
  .put(protect, updateDiscussion)
  .delete(protect, deleteDiscussion);

// Add reply to discussion
router.put('/:id/reply', protect, addReply);

// Delete reply from discussion
router.delete('/:id/reply/:replyId', protect, deleteReply);

module.exports = router;