// final-check.js
console.log('=== Final Route Check ===\n');

// Check auth
try {
  const auth = require('./middleware/auth');
  console.log('✅ Auth middleware:', typeof auth);
} catch (error) {
  console.log('❌ Auth error:', error.message);
}

// Check models
try {
  const Product = require('./models/Product');
  console.log('✅ Product model loaded');
} catch (error) {
  console.log('❌ Product model error:', error.message);
}

try {
  const Order = require('./models/Order');
  console.log('✅ Order model loaded');
} catch (error) {
  console.log('❌ Order model error:', error.message);
}

try {
  const Payment = require('./models/Payment');
  console.log('✅ Payment model loaded');
} catch (error) {
  console.log('❌ Payment model error:', error.message);
}

// Check routes
try {
  const productRoutes = require('./routes/productRoutes');
  console.log('✅ Product routes:', typeof productRoutes);
} catch (error) {
  console.log('❌ Product routes error:', error.message);
}

try {
  const orderRoutes = require('./routes/orderRoutes');
  console.log('✅ Order routes:', typeof orderRoutes);
} catch (error) {
  console.log('❌ Order routes error:', error.message);
}

try {
  const paymentRoutes = require('./routes/paymentRoutes');
  console.log('✅ Payment routes:', typeof paymentRoutes);
} catch (error) {
  console.log('❌ Payment routes error:', error.message);
}

console.log('\n=== All checks complete ===');