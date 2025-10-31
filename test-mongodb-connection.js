const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('🔗 Testing MongoDB connection...');
  console.log('📍 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔗 MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI is not set');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('📍 Database:', conn.connection.name);
    console.log('🌐 Host:', conn.connection.host);
    console.log('🔢 Port:', conn.connection.port);
    
    // Test a simple query
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('🔍 Full error:', error);
    process.exit(1);
  }
}

testConnection();
