const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Token expires after 1 hour
passwordResetSchema.index({ expires: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);