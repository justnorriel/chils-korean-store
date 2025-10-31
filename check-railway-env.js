// Railway Environment Variable Checker
console.log('🔍 Railway Environment Check');
console.log('============================');

console.log('📋 Environment Variables:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set (should be production)'}`);
console.log(`   PORT: ${process.env.PORT || 'Not set (Railway sets this automatically)'}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'Set ✅' : 'Not set ❌'}`);
console.log(`   SESSION_SECRET: ${process.env.SESSION_SECRET ? 'Set ✅' : 'Not set ❌'}`);

if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI;
  console.log('\n🔗 MongoDB URI Analysis:');
  console.log(`   Protocol: ${uri.includes('mongodb+srv') ? 'mongodb+srv ✅' : 'mongodb (should use srv)'}`);
  console.log(`   Has username: ${uri.includes('://') && uri.includes('@') ? 'Yes ✅' : 'No ❌'}`);
  console.log(`   Has password: ${uri.includes(':') && uri.includes('@') ? 'Yes ✅' : 'No ❌'}`);
  console.log(`   Has cluster: ${uri.includes('cluster') ? 'Yes ✅' : 'No ❌'}`);
  console.log(`   Has database: ${uri.includes('.net/') ? 'Yes ✅' : 'No ❌'}`);
  console.log(`   Has retryWrites: ${uri.includes('retryWrites=true') ? 'Yes ✅' : 'No ❌'}`);
  console.log(`   Has w=majority: ${uri.includes('w=majority') ? 'Yes ✅' : 'No ❌'}`);
  
  // Extract and show host (without credentials)
  const hostPart = uri.split('@')[1]?.split('/')[0];
  if (hostPart) {
    console.log(`   Host: ${hostPart}`);
  }
}

console.log('\n🚨 Required Actions:');
if (!process.env.NODE_ENV) {
  console.log('   ❌ Set NODE_ENV=production in Railway');
}
if (!process.env.MONGODB_URI) {
  console.log('   ❌ Set MONGODB_URI in Railway');
}
if (!process.env.SESSION_SECRET) {
  console.log('   ❌ Set SESSION_SECRET in Railway');
}

console.log('\n🔧 Railway Setup Steps:');
console.log('   1. Go to your Railway project');
console.log('   2. Click Settings → Variables');
console.log('   3. Add these variables:');
console.log('      NODE_ENV=production');
console.log('      MONGODB_URI=your_mongodb_connection_string');
console.log('      SESSION_SECRET=your_long_random_secret');
console.log('   4. Redeploy your application');

console.log('\n🌐 MongoDB Atlas Setup:');
console.log('   1. Go to MongoDB Atlas → Network Access');
console.log('   2. Add IP: 0.0.0.0/0 (allows all IPs)');
console.log('   3. Or add Railway\'s IP ranges');
console.log('   4. Ensure database user has read/write permissions');
