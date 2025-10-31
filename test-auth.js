// test-auth.js
const auth = require('./middleware/auth');

console.log('Testing auth middleware...');
console.log('Auth type:', typeof auth);
console.log('Is function:', typeof auth === 'function');

// Test if it can be called as middleware
const mockReq = { user: null };
const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.data = data;
    return this;
  }
};
const mockNext = () => console.log('Next called');

try {
  auth(mockReq, mockRes, mockNext);
  console.log('✅ Auth middleware works!');
  console.log('User set:', mockReq.user);
} catch (error) {
  console.log('❌ Auth middleware error:', error.message);
}