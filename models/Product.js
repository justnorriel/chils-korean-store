const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: {
      values: ['main-course', 'side-dish', 'beverage', 'dessert'],
      message: 'Category must be one of: main-course, side-dish, beverage, dessert'
    }
  },
  image: {
    type: String,
    default: '/images/default-food.jpg'
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  ingredients: {
    type: [String],
    default: []
  },
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'spicy', 'very-spicy'],
    default: 'medium'
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ isAvailable: 1, stock: 1 });

// Virtual for checking if product is in stock
productSchema.virtual('inStock').get(function() {
  return this.stock > 0 && this.isAvailable;
});

// Instance method to check stock availability
productSchema.methods.hasStock = function(quantity) {
  return this.stock >= quantity && this.isAvailable;
};

// Static method to get available products
productSchema.statics.getAvailableProducts = function() {
  return this.find({ 
    isAvailable: true, 
    stock: { $gt: 0 } 
  });
};

// Static method to get products by category
productSchema.statics.getByCategory = function(category) {
  return this.find({ 
    category, 
    isAvailable: true, 
    stock: { $gt: 0 } 
  });
};

module.exports = mongoose.model('Product', productSchema);