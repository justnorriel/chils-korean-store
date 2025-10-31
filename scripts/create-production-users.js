const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createProductionUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chils_korean_store');
    
    console.log('🔧 Creating production users...');
    
    // Admin Account (same as localhost)
    const adminUser = await User.findOne({ email: 'admin@chils.com' });
    if (!adminUser) {
      const admin = new User({
        name: 'Administrator',
        email: 'admin@chils.com',
        password: 'Admin123',
        role: 'admin',
        phone: '+1 (555) 010-1001',
        address: {
          street: '123 Admin Avenue',
          city: 'Seoul',
          zipCode: '10001'
        }
      });
      await admin.save();
      console.log('✅ Admin created: admin@chils.com / Admin123');
    } else {
      console.log('ℹ️ Admin already exists: admin@chils.com');
    }
    
    // Test Customer Account
    const customerUser = await User.findOne({ email: 'customer@test.com' });
    if (!customerUser) {
      const customer = new User({
        name: 'Test Customer',
        email: 'customer@test.com',
        password: 'Customer123',
        role: 'customer',
        phone: '+1 (555) 010-2002',
        address: {
          street: '456 Customer Street',
          city: 'Busan',
          zipCode: '20002'
        }
      });
      await customer.save();
      console.log('✅ Customer created: customer@test.com / Customer123');
    } else {
      console.log('ℹ️ Customer already exists: customer@test.com');
    }
    
    console.log('🎉 Production users setup completed!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('🔑 Admin: admin@chils.com / Admin123');
    console.log('👤 Customer: customer@test.com / Customer123');
    console.log('');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating production users:', error);
    process.exit(1);
  }
};

createProductionUsers();
