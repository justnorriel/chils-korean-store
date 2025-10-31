const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// @desc    Get all available products for customers
// @route   GET /api/customer/menu
// @access  Private (Customer)
router.get('/menu', auth, async (req, res) => {
  try {
    const products = await Product.find({ 
      isAvailable: true,
      stock: { $gt: 0 }
    }).sort({ category: 1, name: 1 });

    res.json({
      success: true,
      data: products,
      count: products.length,
      message: 'Menu fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu: ' + error.message
    });
  }
});

// @desc    Get products by category
// @route   GET /api/customer/menu/category/:category
// @access  Private (Customer)
router.get('/menu/category/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    
    const validCategories = ['main-course', 'side-dish', 'beverage', 'dessert'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const products = await Product.find({ 
      category,
      isAvailable: true,
      stock: { $gt: 0 }
    }).sort({ name: 1 });

    res.json({
      success: true,
      data: products,
      message: `${category} menu fetched successfully`
    });
  } catch (error) {
    console.error('Error fetching menu by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu'
    });
  }
});

// @desc    Get single product details
// @route   GET /api/customer/menu/:id
// @access  Private (Customer)
router.get('/menu/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isAvailable: true,
      stock: { $gt: 0 }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable'
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product details fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
});

module.exports = router;