const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const fixAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/chils_korean_store', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@chils.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Creating one...');
      
      // Create admin user with properly hashed password
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const newAdmin = await User.create({
        name: 'System Administrator',
        email: 'admin@chils.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+639123456789',
        address: {
          street: '123 Admin Street',
          city: 'Manila',
          zipCode: '1000'
        }
      });
      
      console.log('✅ Admin user created with proper password hash');
      console.log('📋 Login: admin@chils.com / admin123');
    } else {
      console.log('🔄 Updating existing admin password...');
      
      // Update the password with proper hash
      adminUser.password = 'admin123'; // This will be hashed by the pre-save middleware
      await adminUser.save();
      
      console.log('✅ Admin password updated with proper hash');
      console.log('📋 Login: admin@chils.com / admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixAdminPassword();