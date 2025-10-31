const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

require('dotenv').config();

const initDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chils_korean_store', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create admin user
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
      console.log('✅ Admin user created: admin@chils.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create sample products
    const sampleProducts = [
      {
        name: 'Bibimbap',
        description: 'Mixed rice with meat and assorted vegetables',
        price: 12.99,
        category: 'main-course',
        stock: 50,
        ingredients: ['rice', 'beef', 'vegetables', 'egg', 'gochujang'],
        spiceLevel: 'medium'
      },
      {
        name: 'Kimchi',
        description: 'Traditional fermented Korean side dish',
        price: 4.99,
        category: 'side-dish',
        stock: 100,
        ingredients: ['cabbage', 'radish', 'scallions', 'chili powder'],
        spiceLevel: 'spicy'
      },
      {
        name: 'Bulgogi',
        description: 'Marinated beef barbecue',
        price: 15.99,
        category: 'main-course',
        stock: 30,
        ingredients: ['beef', 'soy sauce', 'sesame oil', 'garlic', 'pear'],
        spiceLevel: 'mild'
      },
      {
        name: 'Korean Beer',
        description: 'Refreshing Korean lager',
        price: 5.99,
        category: 'beverage',
        stock: 200,
        ingredients: ['water', 'malt', 'hops', 'yeast'],
        spiceLevel: 'mild'
      },
      {
        name: 'Tteokbokki',
        description: 'Spicy rice cakes',
        price: 8.99,
        category: 'main-course',
        stock: 40,
        ingredients: ['rice cakes', 'gochujang', 'fish cakes', 'green onions'],
        spiceLevel: 'spicy'
      },
      {
        name: 'Kimchi Fried Rice',
        description: 'Fried rice with kimchi and vegetables',
        price: 10.99,
        category: 'main-course',
        stock: 35,
        ingredients: ['rice', 'kimchi', 'vegetables', 'egg', 'sesame oil'],
        spiceLevel: 'medium'
      }
    ];

    for (const productData of sampleProducts) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        await Product.create(productData);
        console.log(`✅ Product created: ${productData.name}`);
      } else {
        console.log(`ℹ️ Product already exists: ${productData.name}`);
      }
    }

    console.log('🎉 Database initialization completed!');
    console.log('📊 Sample data has been created');
    console.log('👤 Admin login: admin@chils.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase();