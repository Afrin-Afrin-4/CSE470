const express = require('express');
const { 
  getSystemOverview,
  getCoursePerformance,
  getUserActivity,
  getFinancialReport
} = require('../controllers/reportController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/overview')
  .get(getSystemOverview);

router.route('/courses')
  .get(getCoursePerformance);

router.route('/users')
  .get(getUserActivity);

router.route('/financial')
  .get(getFinancialReport);

module.exports = router;