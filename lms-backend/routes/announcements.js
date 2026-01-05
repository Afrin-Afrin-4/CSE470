const express = require('express');
const { 
  createAnnouncement, 
  getAnnouncementsForCourse, 
  updateAnnouncement, 
  deleteAnnouncement 
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Route for creating and getting announcements for a specific course
router.route('/')
  .post(protect, createAnnouncement)
  .get(protect, getAnnouncementsForCourse);

// Route for updating and deleting a specific announcement
router.route('/:announcementId')
  .put(protect, updateAnnouncement)
  .delete(protect, deleteAnnouncement);

module.exports = router;