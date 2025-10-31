const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/chils_korean_store', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Delete existing admin user
    await User.deleteOne({ email: 'admin@chils.com' });
    console.log('🗑️  Deleted existing admin user');

    // Create a fresh admin user - this will trigger the password hashing
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@chils.com',
      password: 'admin123', // This will be automatically hashed by the pre-save hook
      role: 'admin',
      phone: '+639123456789',
      address: {
        street: '123 Admin Street',
        city: 'Manila',
        zipCode: '1000'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📋 Login credentials:');
    console.log('   Email: admin@chils.com');
    console.log('   Password: admin123');
    console.log('   Password Hash:', adminUser.password.substring(0, 50) + '...');

    // Verify the password works
    const isPasswordCorrect = await adminUser.correctPassword('admin123', adminUser.password);
    console.log('🔐 Password verification:', isPasswordCorrect ? '✅ SUCCESS' : '❌ FAILED');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdmin();