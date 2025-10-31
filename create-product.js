const mongoose = require('mongoose');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: "Bibimbap",
    description: "Traditional Korean rice bowl with mixed vegetables, beef, and egg",
    price: 12.99,
    category: "main-course",
    stock: 20,
    ingredients: ["rice", "beef", "vegetables", "egg", "gochujang"],
    spiceLevel: "medium",
    image: "bibimbap.jpg"
  },
  {
    name: "Kimchi",
    description: "Spicy fermented cabbage side dish",
    price: 4.99,
    category: "side-dish",
    stock: 30,
    ingredients: ["cabbage", "gochugaru", "garlic", "ginger"],
    spiceLevel: "spicy",
    image: "kimchi.jpg"
  },
  {
    name: "Bulgogi",
    description: "Marinated beef barbecue",
    price: 15.99,
    category: "main-course",
    stock: 15,
    ingredients: ["beef", "soy sauce", "sesame oil", "garlic"],
    spiceLevel: "mild",
    image: "bulgogi.jpg"
  },
  {
    name: "Tteokbokki",
    description: "Spicy rice cakes",
    price: 8.99,
    category: "main-course", 
    stock: 25,
    ingredients: ["rice cakes", "gochujang", "fish cakes"],
    spiceLevel: "spicy",
    image: "tteokbokki.jpg"
  },
  {
    name: "Korean Fried Chicken",
    description: "Crispy fried chicken with sweet spicy sauce",
    price: 13.99,
    category: "main-course",
    stock: 18,
    ingredients: ["chicken", "flour", "gochujang", "honey"],
    spiceLevel: "medium",
    image: "korean-chicken.jpg"
  },
  {
    name: "Japchae",
    description: "Sweet potato noodle stir fry with vegetables",
    price: 11.99,
    category: "main-course",
    stock: 12,
    ingredients: ["sweet potato noodles", "vegetables", "beef", "sesame oil"],
    spiceLevel: "mild",
    image: "japchae.jpg"
  },
  {
    name: "Kimchi Stew",
    description: "Spicy kimchi and tofu stew",
    price: 10.99,
    category: "main-course",
    stock: 22,
    ingredients: ["kimchi", "tofu", "pork", "gochugaru"],
    spiceLevel: "spicy",
    image: "kimchi-stew.jpg"
  },
  {
    name: "Korean Rice Water",
    description: "Traditional Korean rice beverage",
    price: 3.99,
    category: "beverage",
    stock: 50,
    ingredients: ["rice", "water", "sugar"],
    spiceLevel: "mild",
    image: "rice-water.jpg"
  },
  {
    name: "Soju",
    description: "Classic Korean distilled spirit",
    price: 8.99,
    category: "beverage",
    stock: 40,
    ingredients: ["rice", "sweet potato", "barley"],
    spiceLevel: "mild",
    image: "soju.jpg"
  },
  {
    name: "Bingsu",
    description: "Korean shaved ice dessert with sweet toppings",
    price: 7.99,
    category: "dessert",
    stock: 15,
    ingredients: ["shaved ice", "red beans", "condensed milk", "fruit"],
    spiceLevel: "mild",
    image: "bingsu.jpg"
  }
];

async function createProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/chils_korean_store', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${sampleProducts.length} sample products`);
    
    // Verify
    const count = await Product.countDocuments();
    console.log(`Total products in database: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating products:', error);
    process.exit(1);
  }
}

createProducts(); 