const bcrypt = require('bcryptjs');

const testPassword = async () => {
  console.log('🔐 Testing Password Hashing');
  console.log('============================');
  
  const password = 'admin123';
  
  // Hash the password
  const hash = await bcrypt.hash(password, 12);
  console.log('Generated Hash:', hash);
  
  // Test the exact hash we're using
  const ourHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdC4SJc8R6zQJoW';
  const test1 = await bcrypt.compare(password, ourHash);
  console.log('Test with our hash:', test1);
  
  // Test with newly generated hash
  const test2 = await bcrypt.compare(password, hash);
  console.log('Test with new hash:', test2);
  
  // Test wrong password
  const test3 = await bcrypt.compare('wrongpassword', ourHash);
  console.log('Test wrong password:', test3);
};

testPassword();