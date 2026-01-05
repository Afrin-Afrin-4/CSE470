const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto', 'bkash', 'points', 'other'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  refundedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
paymentSchema.index({ student: 1, course: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);