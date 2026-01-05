const express = require('express');
const {
  processPayment,
  getPaymentHistory,
  getPaymentDetails,
  refundPayment,
  handleWebhook,
  simpleProcessPayment,
  getAllPayments,
  redeemBadgePoints
} = require('../controllers/paymentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route for webhook
router.route('/webhook')
  .post(handleWebhook);

// Protected routes
router.use(protect);

router.route('/process')
  .post(processPayment);

// Simple demo payment route (no Stripe required)
router.route('/simple-process')
  .post(simpleProcessPayment);

// Redeem badge points for course enrollment
router.route('/redeem-points')
  .post(redeemBadgePoints);

router.route('/')
  .get(authorize('admin'), getAllPayments);

router.route('/history')
  .get(getPaymentHistory);

router.route('/:id')
  .get(getPaymentDetails);

router.route('/:id/refund')
  .put(authorize('admin'), refundPayment);

module.exports = router;
