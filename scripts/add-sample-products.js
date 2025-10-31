const mongoose = require('mongoose');
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Bibimbap',
    description: 'Mixed rice with meat and assorted vegetables, served with gochujang',
    price: 12.99,
    category: 'main-course',
    stock: 50,
    ingredients: ['rice', 'beef', 'vegetables', 'egg', 'gochujang'],
    spiceLevel: 'medium'
  },
  {
    name: 'Kimchi',
    description: 'Traditional fermented Korean side dish made of vegetables',
    price: 4.99,
    category: 'side-dish',
    stock: 100,
    ingredients: ['cabbage', 'radish', 'scallions', 'chili powder'],
    spiceLevel: 'spicy'
  },
  {
    name: 'Bulgogi',
    description: 'Thinly sliced marinated beef barbecue',
    price: 15.99,
    category: 'main-course',
    stock: 30,
    ingredients: ['beef', 'soy sauce', 'sesame oil', 'garlic', 'pear'],
    spiceLevel: 'mild'
  },
  {
    name: 'Korean Beer (Cass)',
    description: 'Refreshing Korean lager beer',
    price: 5.99,
    category: 'beverage',
    stock: 200,
    ingredients: ['water', 'malt', 'hops', 'yeast'],
    spiceLevel: 'mild'
  },
  {
    name: 'Tteokbokki',
    description: 'Spicy stir-fried rice cakes',
    price: 8.99,
    category: 'main-course',
    stock: 40,
    ingredients: ['rice cakes', 'gochujang', 'fish cakes', 'green onions'],
    spiceLevel: 'spicy'
  },
  {
    name: 'Kimchi Fried Rice',
    description: 'Fried rice with kimchi and vegetables, topped with egg',
    price: 10.99,
    category: 'main-course',
    stock: 35,
    ingredients: ['rice', 'kimchi', 'vegetables', 'egg', 'sesame oil'],
    spiceLevel: 'medium'
  },
  {
    name: 'Japchae',
    description: 'Sweet potato noodles stir-fried with vegetables and beef',
    price: 11.99,
    category: 'main-course',
    stock: 25,
    ingredients: ['sweet potato noodles', 'beef', 'vegetables', 'sesame oil'],
    spiceLevel: 'mild'
  },
  {
    name: 'Korean Iced Tea',
    description: 'Refreshing traditional Korean iced tea',
    price: 3.99,
    category: 'beverage',
    stock: 150,
    ingredients: ['tea leaves', 'honey', 'ice'],
    spiceLevel: 'mild'
  }
];

const addSampleProducts = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/chils_korean_store', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Add sample products
    for (const productData of sampleProducts) {
      await Product.create(productData);
      console.log(`Added: ${productData.name}`);
    }

    console.log('Sample products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addSampleProducts();