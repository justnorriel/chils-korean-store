const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const router = express.Router();

// Debug endpoint to test database connection
router.get('/debug', async (req, res) => {
  try {
    // Test database connection
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Test user query
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    
    res.json({
      success: true,
      database: {
        state: states[state],
        userCount: userCount,
        uri: process.env.MONGODB_URI ? 'Set' : 'Not set',
        env: process.env.NODE_ENV || 'development'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      database: {
        state: 'error',
        uri: process.env.MONGODB_URI ? 'Set' : 'Not set',
        env: process.env.NODE_ENV || 'development'
      },
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
