const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

require('dotenv').config();

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chils_korean_store', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'chils-korean-store-session-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import models to ensure they're registered
console.log('📦 Loading models...');
require('./models/User');
require('./models/Product');
require('./models/Order');
require('./models/Payment');
console.log('✅ All models loaded');

// Routes loading with better error handling
console.log('🔄 Loading routes...');

// Auth routes
try {
  app.use('/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.log('❌ Error loading auth routes:', error.message);
}

// Admin routes
try {
  const adminRoutes = require('./routes/admin');
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes loaded');
} catch (error) {
  console.log('❌ Error loading admin routes:', error.message);
}

// Customer routes
try {
  console.log('Loading product routes...');
  const productRoutes = require('./routes/productRoutes');
  app.use('/api/customer', productRoutes);
  console.log('✅ Product routes loaded');
} catch (error) {
  console.log('❌ Error loading product routes:', error.message);
}

try {
  console.log('Loading order routes...');
  const orderRoutes = require('./routes/orderRoutes');
  app.use('/api/customer', orderRoutes);
  console.log('✅ Order routes loaded');
} catch (error) {
  console.log('❌ Error loading order routes:', error.message);
}

try {
  console.log('Loading customer profile routes...');
  const customerRoutes = require('./routes/customerRoutes');
  app.use('/api/customer', customerRoutes);
  console.log('✅ Customer routes loaded');
} catch (error) {
  console.log('❌ Error loading customer routes:', error.message);
}

try {
  console.log('Loading payment routes...');
  const paymentRoutes = require('./routes/paymentRoutes');
  app.use('/api/customer', paymentRoutes);
  console.log('✅ Payment routes loaded');
} catch (error) {
  console.log('❌ Error loading payment routes:', error.message);
}

// Dashboard routes with enhanced session checking
app.get('/admin/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).render('error', { 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  res.render('admin/dashboard', { 
    user: req.session.user,
    title: 'Admin Dashboard - Chil\'s Korean Store'
  });
});

app.get('/customer/dashboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (req.session.user.role !== 'customer') {
    return res.status(403).render('error', { 
      message: 'Access denied. Customer account required.' 
    });
  }
  
  try {
    // Fetch complete user data from database
    const User = require('./models/User');
    const fullUser = await User.findById(req.session.user._id);
    
    res.render('customer/dashboard', { 
      user: fullUser,
      title: 'Customer Dashboard - Chil\'s Korean Store'
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.render('customer/dashboard', { 
      user: req.session.user,
      title: 'Customer Dashboard - Chil\'s Korean Store'
    });
  }
});

// Home page with role-based redirection
app.get('/', (req, res) => {
  if (req.session.user) {
    // Redirect to appropriate dashboard based on role
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/customer/dashboard');
    }
  }
  res.redirect('/auth/login');
});

// Public API endpoints for testing
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test database connection and models
app.get('/api/test/database', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const User = require('./models/User');
    const Order = require('./models/Order');
    
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    
    res.json({
      success: true,
      data: {
        products: productCount,
        users: userCount,
        orders: orderCount,
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      },
      message: 'Database test successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed: ' + error.message
    });
  }
});

// Test products endpoint
app.get('/api/test/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find().limit(5).lean();
    
    res.json({
      success: true,
      data: products,
      count: products.length,
      message: 'Products test successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Products test failed: ' + error.message
    });
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve favicon files
app.use('/favicon', express.static(path.join(__dirname, 'favicon')));

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// 404 handler for pages
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found',
    title: '404 - Page Not Found'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Global error handler:');
  console.error(err.stack);
  
  // If headers already sent, delegate to default error handler
  if (res.headersSent) {
    return next(err);
  }
  
  // API error response
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
  
  // Page error response
  res.status(500).render('error', {
    message: 'Something went wrong! Please try again later.',
    title: '500 - Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 3000;

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📍 URLs:
   • Login page: http://localhost:${PORT}/auth/login
   • Admin dashboard: http://localhost:${PORT}/admin/dashboard
   • Customer dashboard: http://localhost:${PORT}/customer/dashboard
   • API Health check: http://localhost:${PORT}/api/health
   • Database test: http://localhost:${PORT}/api/test/database
   • Products test: http://localhost:${PORT}/api/test/products

📊 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});