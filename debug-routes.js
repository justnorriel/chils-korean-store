console.log('=== Debugging Route Loading ===');

// Test loading each route file
try {
  console.log('\n1. Testing Product model...');
  const Product = require('./models/Product');
  console.log('✅ Product model loaded successfully');
} catch (error) {
  console.log('❌ Product model error:', error.message);
}

try {
  console.log('\n2. Testing auth middleware...');
  const auth = require('./middleware/auth');
  console.log('✅ Auth middleware loaded successfully');
  console.log('Auth type:', typeof auth);
} catch (error) {
  console.log('❌ Auth middleware error:', error.message);
}

try {
  console.log('\n3. Testing productRoutes...');
  const productRoutes = require('./routes/productRoutes');
  console.log('✅ productRoutes loaded successfully');
  console.log('Routes type:', typeof productRoutes);
} catch (error) {
  console.log('❌ productRoutes error:', error.message);
}

try {
  console.log('\n4. Testing orderRoutes...');
  const orderRoutes = require('./routes/orderRoutes');
  console.log('✅ orderRoutes loaded successfully');
  console.log('Routes type:', typeof orderRoutes);
} catch (error) {
  console.log('❌ orderRoutes error:', error.message);
}

try {
  console.log('\n5. Testing paymentRoutes...');
  const paymentRoutes = require('./routes/paymentRoutes');
  console.log('✅ paymentRoutes loaded successfully');
  console.log('Routes type:', typeof paymentRoutes);
} catch (error) {
  console.log('❌ paymentRoutes error:', error.message);
}

console.log('\n=== Debug Complete ===');