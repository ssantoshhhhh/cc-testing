const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    pricePerDay: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  rentalDays: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date,
    required: true
  },
  actualReturnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rented', 'returned', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  penaltyAmount: {
    type: Number,
    default: 0
  },
  penaltyDays: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate expected return date
orderSchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('rentalDays')) {
    const returnDate = new Date(this.startDate);
    returnDate.setDate(returnDate.getDate() + this.rentalDays);
    this.expectedReturnDate = returnDate;
  }
  this.updatedAt = Date.now();
  next();
});

// Virtual for calculating if order is overdue
orderSchema.virtual('isOverdue').get(function() {
  if (this.status === 'returned') return false;
  return new Date() > this.expectedReturnDate;
});

// Virtual for calculating overdue days
orderSchema.virtual('overdueDays').get(function() {
  if (this.status === 'returned' || new Date() <= this.expectedReturnDate) return 0;
  const diffTime = Math.abs(new Date() - this.expectedReturnDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for calculating remaining days
orderSchema.virtual('remainingDays').get(function() {
  if (this.status === 'returned') return 0;
  if (new Date() > this.expectedReturnDate) return 0;
  const diffTime = Math.abs(this.expectedReturnDate - new Date());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema); 