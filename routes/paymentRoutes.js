const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

// @desc    Create GCash payment for an order
// @route   POST /api/customer/orders/:id/pay
// @access  Private (Customer)
router.post('/orders/:id/pay', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Generate GCash reference
    const gcashReference = 'GC' + Date.now();

    // Generate QR code URL (using a free QR code service)
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GCASH-${gcashReference}-${order.totalAmount}`;

    // Create payment record
    const payment = new Payment({
      order: order._id,
      customer: req.user._id,
      amount: order.totalAmount,
      method: 'gcash',
      status: 'pending',
      gcashReference,
      qrCode
    });

    await payment.save();

    res.json({
      success: true,
      data: {
        payment,
        qrCode,
        gcashReference
      },
      message: 'GCash payment initiated successfully'
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment'
    });
  }
});

// @desc    Confirm payment
// @route   POST /api/customer/payments/:id/confirm
// @access  Private (Customer)
router.post('/payments/:id/confirm', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      customer: req.user._id
    }).populate('order');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status
    payment.status = 'completed';
    payment.completedAt = new Date();
    await payment.save();

    // Update order status
    payment.order.paymentStatus = 'paid';
    payment.order.status = 'confirmed';
    await payment.order.save();

    res.json({
      success: true,
      data: {
        payment,
        order: payment.order
      },
      message: 'Payment confirmed successfully!'
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming payment'
    });
  }
});

module.exports = router;  