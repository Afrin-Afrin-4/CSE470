const express = require('express');
const { 
  getBadges, 
  getBadge, 
  createBadge, 
  updateBadge, 
  deleteBadge,
  getUserAchievements,
  awardBadge
} = require('../controllers/badgeController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getBadges)
  .post(protect, authorize('admin'), createBadge);

router
  .route('/:id')
  .get(getBadge)
  .put(protect, authorize('admin'), updateBadge)
  .delete(protect, authorize('admin'), deleteBadge);

// Get user achievements
router.get('/users/:userId/achievements', protect, getUserAchievements);

// Award badge to user
router.post('/users/:userId/badges/:badgeId', protect, authorize('admin'), awardBadge);

module.exports = router;