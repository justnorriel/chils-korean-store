const mongoose = require('mongoose');
require('dotenv').config();

async function diagnoseConnection() {
  console.log('🔍 MongoDB Connection Diagnosis');
  console.log('================================');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
  
  if (!process.env.MONGODB_URI) {
    console.log('❌ MONGODB_URI is missing!');
    return;
  }

  // Parse connection string
  try {
    const uri = process.env.MONGODB_URI;
    console.log(`\n🔗 Connection String Analysis:`);
    console.log(`   Protocol: ${uri.includes('mongodb+srv') ? 'mongodb+srv (SRV)' : 'mongodb (Standard)'}`);
    console.log(`   Host: ${uri.split('@')[1]?.split('/')[0] || 'Unknown'}`);
    console.log(`   Database: ${uri.split('/').pop()?.split('?')[0] || 'Unknown'}`);
    
    // Test connection with different timeout settings
    console.log(`\n🧪 Connection Tests:`);
    
    // Test 1: Short timeout
    console.log(`   Test 1: Short timeout (10s)...`);
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 10000,
      });
      console.log('   ✅ Short timeout test passed');
      await mongoose.connection.close();
    } catch (err) {
      console.log(`   ❌ Short timeout test failed: ${err.message}`);
    }
    
    // Test 2: Long timeout
    console.log(`   Test 2: Long timeout (60s)...`);
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 60000,
        socketTimeoutMS: 60000,
      });
      console.log('   ✅ Long timeout test passed');
      
      // Get connection info
      const admin = mongoose.connection.db.admin();
      const serverStatus = await admin.serverStatus();
      console.log(`   📊 MongoDB Version: ${serverStatus.version}`);
      console.log(`   🌐 Connection Host: ${mongoose.connection.host}`);
      
      await mongoose.connection.close();
    } catch (err) {
      console.log(`   ❌ Long timeout test failed: ${err.message}`);
      
      // Analyze error type
      if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
        console.log(`   💡 Diagnosis: DNS resolution failed - check hostname`);
      } else if (err.message.includes('ETIMEDOUT')) {
        console.log(`   💡 Diagnosis: Connection timed out - check network/firewall`);
      } else if (err.message.includes('ECONNREFUSED')) {
        console.log(`   💡 Diagnosis: Connection refused - check port/firewall`);
      } else if (err.message.includes('auth')) {
        console.log(`   💡 Diagnosis: Authentication failed - check credentials`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Diagnosis failed: ${error.message}`);
  }
}

diagnoseConnection().catch(console.error);
