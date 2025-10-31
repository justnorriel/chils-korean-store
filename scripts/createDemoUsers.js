const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createDemoUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chils_korean_store');
    
    console.log('🔧 Creating demo users...');
    
    // Demo Admin
    const adminUser = await User.findOne({ email: 'admin@chilsstore.com' });
    if (!adminUser) {
      const admin = new User({
        name: 'Demo Administrator',
        email: 'admin@chilsstore.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1 (555) 010-1001',
        address: {
          street: '123 Admin Avenue',
          city: 'Seoul',
          zipCode: '10001'
        }
      });
      await admin.save();
      console.log('✅ Demo admin created: admin@chilsstore.com / admin123');
    } else {
      console.log('ℹ️ Demo admin already exists');
    }
    
    // Demo Customer
    const customerUser = await User.findOne({ email: 'customer@example.com' });
    if (!customerUser) {
      const customer = new User({
        name: 'Demo Customer',
        email: 'customer@example.com',
        password: 'customer123',
        role: 'customer',
        phone: '+1 (555) 010-2002',
        address: {
          street: '456 Customer Street',
          city: 'Busan',
          zipCode: '20002'
        }
      });
      await customer.save();
      console.log('✅ Demo customer created: customer@example.com / customer123');
    } else {
      console.log('ℹ️ Demo customer already exists');
    }
    
    console.log('🎉 Demo users setup completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    process.exit(1);
  }
};

createDemoUsers();