const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// @desc    Get customer's orders
// @route   GET /api/customer/orders
// @access  Private (Customer)
router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('items.product', 'name price image category')
      .sort({ orderDate: -1 });

    res.json({
      success: true,
      data: orders,
      message: 'Orders fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @desc    Create new order
// @route   POST /api/customer/orders
// @access  Private (Customer)
router.post('/orders', auth, async (req, res) => {
  try {
    const { items, deliveryAddress, specialInstructions } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Process each item and check stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is currently unavailable`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order - orderNumber will be auto-generated
    const order = new Order({
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress || {
        street: '123 Main St',
        city: 'Manila',
        zipCode: '1000'
      },
      specialInstructions: specialInstructions || ''
    });

    // Save order (triggers orderNumber generation)
    await order.save();

    // Update product stocks
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Populate product details for response
    await order.populate('items.product', 'name price image category');

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order: ' + error.message
    });
  }
});

// @desc    Get single order details
// @route   GET /api/customer/orders/:id
// @access  Private (Customer)
router.get('/orders/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id
    }).populate('items.product', 'name price image category description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order details fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
});

// @desc    Get order tracking information
// @route   GET /api/customer/orders/:id/tracking
// @access  Private (Customer)
router.get('/orders/:id/tracking', auth, async (req, res) => {
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

    const statusDetails = {
      'pending': 'Order received, waiting for confirmation',
      'confirmed': 'Order confirmed, preparing your food',
      'preparing': 'Chef is cooking your delicious meal',
      'ready': 'Your order is ready for pickup/delivery',
      'completed': 'Order completed! Enjoy your meal!',
      'cancelled': 'Order has been cancelled'
    };

    const trackingInfo = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      statusMessage: statusDetails[order.status] || 'Status unknown',
      orderDate: order.orderDate
    };

    res.json({
      success: true,
      data: trackingInfo,
      message: 'Order tracking fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching order tracking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order tracking'
    });
  }
});

// @desc    Cancel an order
// @route   PUT /api/customer/orders/:id/cancel
// @access  Private (Customer)
router.put('/orders/:id/cancel', auth, async (req, res) => {
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

    // Check if order can be cancelled
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in ${order.status} status`
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
});

module.exports = router;