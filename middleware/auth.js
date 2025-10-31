const User = require('../models/User');

// Main authentication middleware
const auth = (req, res, next) => {
  console.log('🔐 Auth check - Session:', req.session.user ? 'User exists' : 'No user');
  
  // Check if user is logged in via session
  if (!req.session.user) {
    console.log('❌ No user session found');
    return res.status(401).json({
      success: false,
      message: 'Please log in to access this resource'
    });
  }

  // Add user to request object
  req.user = req.session.user;
  console.log('✅ User authenticated:', req.user.email, 'Role:', req.user.role);
  next();
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔒 Authorization check for roles:', roles);
    
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to access this resource'
      });
    }

    if (!roles.includes(req.session.user.role)) {
      console.log('❌ Access denied. User role:', req.session.user.role, 'Required:', roles);
      return res.status(403).json({
        success: false,
        message: `Access denied. ${roles.join(' or ')} privileges required.`
      });
    }

    req.user = req.session.user;
    console.log('✅ Authorization granted for:', req.user.role);
    next();
  };
};

// Development helper - creates mock users for testing
const developmentAuth = (req, res, next) => {
  // If session user exists, use it
  if (req.session && req.session.user) {
    req.user = req.session.user;
    console.log('🔐 Using session user:', req.user.email);
    return next();
  }
  
  // For development only - create mock users based on route
  if (process.env.NODE_ENV === 'development') {
    const isAdminRoute = req.path.includes('/admin/');
    
    if (isAdminRoute) {
      req.user = {
        _id: '65d8f1a2e2a1b4c7d8e9f1a2',
        name: 'Admin User',
        email: 'admin@chilsstore.com',
        role: 'admin',
        address: {
          street: '123 Admin Street',
          city: 'Admin City',
          zipCode: '12345'
        }
      };
      console.log('🔐 Development: Using mock admin user');
    } else {
      req.user = {
        _id: '65d8f1a2e2a1b4c7d8e9f1a3',
        name: 'Test Customer',
        email: 'customer@example.com',
        role: 'customer',
        address: {
          street: '123 Customer Street',
          city: 'Customer City',
          zipCode: '54321'
        }
      };
      console.log('🔐 Development: Using mock customer user');
    }
    
    // Also set session for consistency
    req.session.user = req.user;
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Please log in to access this resource'
    });
  }
};

// Optional: JWT-based auth for future use
const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to access this resource'
      });
    }

    // For now, we'll use session-based auth instead of JWT
    // This is kept for future implementation
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to access this resource'
      });
    }

    req.user = req.session.user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

module.exports = developmentAuth; // Use development auth as default for now
module.exports.auth = auth;
module.exports.authorize = authorize;
module.exports.protect = protect;