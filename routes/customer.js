const express = require('express');
const qr = require('qr-image');
const { protect, authorize } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');

const router = express.Router();

router.use(protect);
router.use(authorize('customer'));

// Get menu items
router.get('/menu', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = { isAvailable: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create order - UPDATED VERSION
router.post('/orders', async (req, res) => {
  try {
    const { items, deliveryAddress, specialInstructions } = req.body;
    
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Calculate total amount and verify products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product ${product?.name || 'Unknown'} is not available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Generate order number manually to ensure it's set
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order with manual order number
    const orderData = {
      orderNumber,
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.address,
      specialInstructions
    };

    console.log('Creating order with data:', orderData);

    const order = await Order.create(orderData);

    await order.populate('items.product', 'name price');

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get customer orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'name price image')
      .sort({ orderDate: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Track specific order
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id
    }).populate('items.product', 'name price image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get order tracking details
router.get('/orders/:id/tracking', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id
    }).populate('items.product', 'name price image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Calculate estimated delivery time
    const orderDate = new Date(order.orderDate);
    const estimatedDelivery = new Date(orderDate.getTime() + 45 * 60000); // 45 minutes
    
    const trackingInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      orderDate: order.orderDate,
      estimatedDelivery: order.estimatedDelivery || estimatedDelivery,
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      specialInstructions: order.specialInstructions
    };

    res.json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Generate GCash QR Code for payment
router.post('/orders/:id/pay', async (req, res) => {
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
        message: 'Order already paid'
      });
    }

    // Generate GCash payment reference
    const gcashReference = 'GC' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create QR code data (simulated GCash payment)
    const qrData = `gcash://pay?amount=${order.totalAmount}&name=Chils+Korean+Store&reference=${gcashReference}`;
    const qrCode = qr.imageSync(qrData, { type: 'png' });

    const payment = await Payment.create({
      order: order._id,
      customer: req.user._id,
      amount: order.totalAmount,
      method: 'gcash',
      gcashReference,
      qrCode: qrCode.toString('base64')
    });

    order.paymentStatus = 'pending';
    await order.save();

    res.json({
      success: true,
      data: {
        payment,
        qrCode: `data:image/png;base64,${qrCode.toString('base64')}`,
        gcashReference
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Confirm payment (simulated - in real app, this would be webhook from GCash)
router.post('/payments/:id/confirm', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment || payment.customer.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.status = 'completed';
    payment.completedAt = new Date();
    await payment.save();

    // Update order payment status
    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: 'paid'
    });

    res.json({
      success: true,
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update customer profile
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        phone,
        address
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get customer profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;