const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: [true, 'Payment must belong to an order']
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Payment must belong to a customer']
  },
  amount: {
    type: Number,
    required: [true, 'Payment must have an amount'],
    min: [0, 'Amount cannot be negative']
  },
  method: {
    type: String,
    enum: {
      values: ['gcash', 'cash'],
      message: 'Payment method must be either gcash or cash'
    },
    default: 'gcash'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'completed', 'failed', 'cancelled'],
      message: 'Status must be one of: pending, completed, failed, cancelled'
    },
    default: 'pending'
  },
  gcashReference: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness for non-null values
  },
  qrCode: {
    type: String
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  transactionId: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
paymentSchema.index({ customer: 1, paymentDate: -1 });
paymentSchema.index({ order: 1 }, { unique: true }); // One payment per order
paymentSchema.index({ gcashReference: 1 }, { sparse: true });
paymentSchema.index({ status: 1 });

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Generate GCash reference if not provided
  if (this.method === 'gcash' && !this.gcashReference) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.gcashReference = `GC${timestamp.slice(-8)}${random}`;
  }
  
  // Generate QR code URL for GCash payments
  if (this.method === 'gcash' && !this.qrCode) {
    this.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GCASH-PAYMENT-${this.gcashReference}&amount=${this.amount}`;
  }
  
  // Set completedAt when payment is completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Static method to create payment for order
paymentSchema.statics.createForOrder = async function(orderId, customerId, amount, method = 'gcash') {
  const Payment = mongoose.model('Payment');
  const Order = mongoose.model('Order');
  
  // Check if payment already exists for this order
  const existingPayment = await Payment.findOne({ order: orderId });
  if (existingPayment) {
    throw new Error('Payment already exists for this order');
  }
  
  // Create new payment
  const payment = new Payment({
    order: orderId,
    customer: customerId,
    amount,
    method
  });
  
  await payment.save();
  
  // Populate the payment with order details
  await payment.populate('order');
  
  return payment;
};

// Instance method to complete payment
paymentSchema.methods.completePayment = async function(transactionId = null) {
  const Order = mongoose.model('Order');
  
  this.status = 'completed';
  this.completedAt = new Date();
  if (transactionId) {
    this.transactionId = transactionId;
  }
  
  await this.save();
  
  // Update order payment status
  await Order.findByIdAndUpdate(this.order, {
    paymentStatus: 'paid',
    status: 'confirmed' // Move order to confirmed status when payment is completed
  });
  
  return this;
};

// Instance method to check if payment can be processed
paymentSchema.methods.canBeProcessed = function() {
  return this.status === 'pending';
};

// Virtual for payment duration
paymentSchema.virtual('paymentDuration').get(function() {
  if (this.completedAt && this.paymentDate) {
    return this.completedAt - this.paymentDate;
  }
  return null;
});

module.exports = mongoose.model('Payment', paymentSchema);