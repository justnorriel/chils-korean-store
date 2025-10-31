const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'customer'],
      message: 'Role must be either admin or customer'
    },
    default: 'customer'
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(phone) {
        if (!phone) return true; // Phone is optional
        return /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
      },
      message: 'Please provide a valid phone number'
    }
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, 'ZIP code cannot exceed 20 characters']
    }
  },
  avatar: {
    type: String,
    default: '/images/default-avatar.png'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    notifications: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true }
    },
    favoriteCategories: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  if (this.isNew) {
    this.createdAt = new Date();
  }
  this.updatedAt = new Date();
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check password (alternative version)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Virtual for user's full address
userSchema.virtual('fullAddress').get(function() {
  if (this.address && this.address.street && this.address.city && this.address.zipCode) {
    return `${this.address.street}, ${this.address.city}, ${this.address.zipCode}`;
  }
  return 'Address not provided';
});

// Virtual for user's order count (would need population)
userSchema.virtual('orderCount', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'customer',
  count: true
});

// Method to get user profile without sensitive data
userSchema.methods.toProfileJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    address: this.address,
    avatar: this.avatar,
    preferences: this.preferences,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };
};

// Static method to find by email (for authentication)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

module.exports = mongoose.model('User', userSchema);