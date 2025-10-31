const express = require('express');
const app = express();

// Test basic route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server is working' });
});

// Test route loading
try {
  const orderRoutes = require('./routes/orderRoutes');
  console.log('✅ orderRoutes loaded successfully');
  console.log('Type:', typeof orderRoutes);
} catch (error) {
  console.log('❌ Error loading orderRoutes:', error.message);
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});