const express = require('express');
const { 
  getUsers, 
  getUser,
  getMyCourses
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/me/courses').get(getMyCourses);

router.route('/')
  .get(authorize('admin'), getUsers);

router.route('/:id')
  .get(authorize('admin'), getUser);

module.exports = router;