require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const testDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test creating a simple user
    const adminUser = await User.findOne({ email: 'admin@chils.com' });
    if (!adminUser) {
      await User.create({
        name: 'Admin User',
        email: 'admin@chils.com',
        password: 'Admin123',
        role: 'admin',
        phone: '+1234567890',
        address: {
          street: '123 Admin St',
          city: 'Admin City',
          zipCode: '12345'
        }
      });
      console.log('✅ Admin user created: admin@chils.com / Admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testDatabase();
