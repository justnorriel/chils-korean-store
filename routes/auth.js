const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Disable Mongoose buffering for this route
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
mongoose.set('bufferMaxEntries', 0);

// Login page
router.get('/login', (req, res) => {
  // If user is already logged in, redirect to appropriate dashboard
  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/customer/dashboard');
    }
  }
  
  res.render('auth/login', {
    title: 'Login - Chil\'s Korean Store',
    error: req.query.error,
    success: req.query.success,
    info: req.query.info
  });
});

// Login handler
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);
    
    // Check database connection and wait if needed
    const mongoose = require('mongoose');
    let attempts = 0;
    const maxAttempts = 3;
    
    while (mongoose.connection.readyState !== 1 && attempts < maxAttempts) {
      console.log(`⏳ Waiting for database connection... (attempt ${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
    
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected during login attempt');
      return res.status(503).render('auth/login', {
        error: 'Database temporarily unavailable. Please try again in a moment.',
        title: 'Login - Chil\'s Korean Store'
      });
    }

    // Input validation
    if (!email || !password) {
      return res.status(400).render('auth/login', {
        error: 'Please provide both email and password',
        title: 'Login - Chil\'s Korean Store'
      });
    }

    // Find user by email with explicit options
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .maxTimeMS(30000) // 30 second timeout for this query
      .readPreference('primary');
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).render('auth/login', {
        error: 'Invalid email or password',
        title: 'Login - Chil\'s Korean Store'
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      console.log('❌ User account inactive:', email);
      return res.status(401).render('auth/login', {
        error: 'Account is deactivated. Please contact administrator.',
        title: 'Login - Chil\'s Korean Store'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).render('auth/login', {
        error: 'Invalid email or password',
        title: 'Login - Chil\'s Korean Store'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    console.log('✅ Login successful:', user.email, 'Role:', user.role);

    // Redirect based on role
    if (user.role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/customer/dashboard');
    }

  } catch (error) {
    console.error('❌ Login error:', error.message);
    console.error('❌ Full error:', error);
    
    // Check for specific database errors
    if (error.name === 'MongooseServerSelectionError') {
      console.error('❌ Database connection error - MongoDB not reachable');
    } else if (error.name === 'MongoTimeoutError') {
      console.error('❌ Database timeout error');
    }
    
    res.status(500).render('auth/login', {
      error: 'Login failed. Please try again later.',
      title: 'Login - Chil\'s Korean Store'
    });
  }
});

// Register page (redirect to signup for compatibility)
router.get('/register', (req, res) => {
  res.redirect('/auth/signup');
});

// Register handler (redirect to signup for compatibility)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, street, city } = req.body;

    console.log('👤 Register attempt for:', email);

    // Validation
    if (!name || !email || !password || !confirmPassword || !street || !city) {
      return res.status(400).render('auth/signup', {
        error: 'Please fill in all required fields',
        title: 'Sign Up - Chil\'s Korean Store'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('auth/signup', {
        error: 'Passwords do not match',
        title: 'Sign Up - Chil\'s Korean Store'
      });
    }

    if (password.length < 6) {
      return res.status(400).render('auth/signup', {
        error: 'Password must be at least 6 characters long',
        title: 'Sign Up - Chil\'s Korean Store'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).render('auth/signup', {
        error: 'User with this email already exists',
        title: 'Sign Up - Chil\'s Korean Store'
      });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      address: {
        street: street,
        city: city
      },
      role: 'customer'
    });

    await user.save();
    console.log('✅ New user created:', email);

    // Auto-login after signup
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect('/customer/dashboard');

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).render('auth/signup', {
      error: 'Registration failed. Please try again.',
      title: 'Sign Up - Chil\'s Korean Store'
    });
  }
});

// Signup page
router.get('/signup', (req, res) => {
  if (req.session.user) {
    return res.redirect('/customer/dashboard');
  }
  
  res.render('auth/signup', {
    title: 'Sign Up - Chil\'s Korean Store',
    error: req.query.error,
    success: req.query.success
  });
});

// Signup handler
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, street, city } = req.body;

    console.log('👤 Signup attempt for:', email);

    // Validation
    if (!name || !email || !password || !confirmPassword || !street || !city) {
      return res.status(400).render('auth/signup', {
        error: 'Please fill in all required fields',
        title: 'Sign Up - Chil\'s Korean Store'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('auth/signup', {
        error: 'Passwords do not match',
        title: 'Sign Up - Chil\'s Korean Store'
      });
    }

    if (password.length < 6) {
      return res.status(400).render('auth/signup', {
        error: 'Password must be at least 6 characters long',
        title: 'Sign Up - Chil\'s Korean Store'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).render('auth/signup', {
        error: 'User with this email already exists',
        title: 'Sign Up - Chil\'s Korean Store'
      });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      address: {
        street: street,
        city: city
      },
      role: 'customer'
    });

    await user.save();
    console.log('✅ New user created:', email);

    // Auto-login after signup
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect('/customer/dashboard');

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).render('auth/signup', {
      error: 'Registration failed. Please try again.',
      title: 'Sign Up - Chil\'s Korean Store'
    });
  }
});

// Logout handler
router.get('/logout', (req, res) => {
  console.log('👋 User logging out:', req.session.user?.email);
  
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
    }
    res.redirect('/auth/login');
  });
});

// Forgot password page
router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Forgot Password - Chil\'s Korean Store',
    error: req.query.error,
    success: req.query.success
  });
});

// Demo login endpoints for testing
router.post('/demo/login', async (req, res) => {
  try {
    const { role } = req.body;
    
    let demoEmail, demoPassword, redirectPath;

    if (role === 'admin') {
      demoEmail = 'admin@chilsstore.com';
      demoPassword = 'admin123';
      redirectPath = '/admin/dashboard';
    } else {
      demoEmail = 'customer@example.com';
      demoPassword = 'customer123';
      redirectPath = '/customer/dashboard';
    }

    // Find or create demo user
    let user = await User.findOne({ email: demoEmail });
    
    if (!user) {
      console.log('🔧 Creating demo user:', demoEmail);
      user = new User({
        name: role === 'admin' ? 'Demo Admin' : 'Demo Customer',
        email: demoEmail,
        password: demoPassword,
        role: role,
        phone: '+1234567890',
        address: {
          street: '123 Demo Street',
          city: 'Demo City',
          zipCode: '12345'
        }
      });
      await user.save();
    }

    // Create session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    console.log('✅ Demo login successful:', demoEmail);
    res.json({ 
      success: true, 
      redirect: redirectPath,
      message: `Demo ${role} login successful!`
    });

  } catch (error) {
    console.error('❌ Demo login error:', error);
    res.status(500).json({
      success: false,
      message: 'Demo login failed'
    });
  }
});

// Check auth status
router.get('/status', (req, res) => {
  res.json({
    isAuthenticated: !!req.session.user,
    user: req.session.user || null
  });
});

module.exports = router;