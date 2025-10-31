const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Apply authentication middleware to all routes
router.use(protect);

// Update customer profile
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user._id;

    console.log('🔄 Updating profile for user:', userId);

    // Validate required fields
    if (!name || !address || !address.street || !address.city) {
      return res.status(400).json({
        success: false,
        message: 'Name, street, and city are required'
      });
    }

    // Prepare update data (email is excluded from updates)
    const updateData = {
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      address: {
        street: address.street.trim(),
        city: address.city.trim()
      }
    };

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update session with new user data (email remains unchanged)
    req.session.user = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email, // Keep original email
      role: updatedUser.role
    };

    console.log('✅ Profile updated successfully for:', updatedUser.email);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email, // Include email in response but it's not editable
        phone: updatedUser.phone,
        address: updatedUser.address
      }
    });

  } catch (error) {
    console.error('❌ Error updating profile:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed: ' + errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update profile: ' + error.message
    });
  }
});

module.exports = router;
