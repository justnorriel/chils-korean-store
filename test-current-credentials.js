const mongoose = require('mongoose');
require('dotenv').config();

async function testCurrentCredentials() {
  console.log('🔍 Testing Current MongoDB Credentials');
  console.log('=====================================');
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('❌ MONGODB_URI not found in .env');
    return;
  }

  console.log('📋 Connection Info:');
  console.log(`   URI: ${uri.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`);
  console.log(`   Host: ${uri.split('@')[1]?.split('/')[0]}`);
  console.log(`   Database: ${uri.split('/').pop()?.split('?')[0]}`);

  try {
    console.log('\n🔗 Attempting connection...');
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
    });
    
    console.log('✅ Connection successful!');
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Host: ${conn.connection.host}`);
    
    // Test database operations
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`   Collections: ${collections.length} found`);
    collections.forEach(c => console.log(`     - ${c.name}`));
    
    // Test a simple query
    if (collections.length > 0) {
      const firstCollection = collections[0].name;
      const count = await db.collection(firstCollection).countDocuments();
      console.log(`   Documents in ${firstCollection}: ${count}`);
    }
    
    await mongoose.connection.close();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.log('❌ Connection failed!');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('Authentication')) {
      console.log('   💡 Issue: Invalid username or password');
      console.log('   🔧 Solution: Check MongoDB Atlas user credentials');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('   💡 Issue: DNS resolution failed');
      console.log('   🔧 Solution: Check cluster hostname');
    } else if (error.message.includes('timed out')) {
      console.log('   💡 Issue: Connection timeout');
      console.log('   🔧 Solution: Check network and IP whitelist');
    }
  }
}

testCurrentCredentials().catch(console.error);
