const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Simple MongoDB Connection Test');
console.log('==================================');

async function simpleTest() {
  // Disable buffering completely
  mongoose.set('bufferCommands', false);
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('❌ MONGODB_URI not found');
    process.exit(1);
  }

  console.log('📍 Testing connection to:', uri.replace(/\/\/([^:]+):[^@]+@/, '//***:***@'));
  
  try {
    console.log('🔗 Connecting...');
    const start = Date.now();
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      maxPoolSize: 1,
      minPoolSize: 1,
    });
    
    const end = Date.now();
    console.log(`✅ Connected in ${end - start}ms`);
    console.log('📍 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Test a simple operation
    console.log('🧪 Testing database operation...');
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    console.log('✅ Ping successful:', result);
    
    // List databases
    const dbs = await admin.listDatabases();
    console.log('📁 Available databases:', dbs.databases.map(d => d.name));
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('🔍 Full error:', error);
    
    // Provide specific advice based on error
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 DNS Issue - Check cluster hostname');
    } else if (error.message.includes('timed out')) {
      console.log('💡 Timeout Issue - Check network/firewall/IP whitelist');
    } else if (error.message.includes('auth')) {
      console.log('💡 Authentication Issue - Check username/password');
    } else if (error.message.includes('ENOTCONN')) {
      console.log('💡 Connection Issue - Network connectivity problem');
    }
    
    process.exit(1);
  }
}

simpleTest();
