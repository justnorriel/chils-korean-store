# 👥 Creating Production Accounts for Chil's Korean Store

## 🎯 The Problem:
Your localhost accounts are stored in your local MongoDB database. When you deployed to Render, it connects to MongoDB Atlas (cloud database), which is completely empty.

## 🚀 Solution: Create Accounts in Production Database

### Option 1: Run Script Locally (Recommended)

#### Step 1: Test Your MongoDB Connection First
```bash
# Navigate to your project directory
cd /home/wanshii/Downloads/chils-korean-store-20251031T002908Z-1-001/chils-korean-store

# Create .env file with your production database
echo "MONGODB_URI=mongodb+srv://fabrianorriel_db_user:gsapdslgsKI8ZFDu@cluster0.ffganpu.mongodb.net/chils_korean_store?retryWrites=true&w=majority" > .env
```

#### Step 2: Run the User Creation Script
```bash
npm run create-users
```

#### Expected Output:
```
🔧 Creating production users...
✅ Admin created: admin@chils.com / Admin123
✅ Customer created: customer@test.com / Customer123

🎉 Production users setup completed!

📋 Login Credentials:
🔑 Admin: admin@chils.com / Admin123
👤 Customer: customer@test.com / Customer123
```

### Option 2: Create Accounts via Web Interface

#### Step 1: Visit Your Render App
Go to: `https://chils-korean-store.onrender.com`

#### Step 2: Register Customer Account
1. Click "Sign Up"
2. Fill in customer details
3. Verify email (if required)

#### Step 3: Create Admin Account (via script)
You'll still need the script to create the admin account since admin registration isn't public.

### Option 3: Manual Database Insert

#### Step 1: Connect to MongoDB Atlas
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. **Collections** → **Insert Document**

#### Step 2: Insert Admin Document
```json
{
  "name": "Administrator",
  "email": "admin@chils.com",
  "password": "$2a$10$hashed_password_here",
  "role": "admin",
  "phone": "+1 (555) 010-1001",
  "address": {
    "street": "123 Admin Avenue",
    "city": "Seoul",
    "zipCode": "10001"
  },
  "createdAt": "2025-10-31T08:00:00.000Z",
  "updatedAt": "2025-10-31T08:00:00.000Z"
}
```

## 🔑 Final Login Credentials:

### For Production (Render):
- **Admin**: `admin@chils.com` / `Admin123`
- **Customer**: `customer@test.com` / `Customer123`

### For Localhost (if you still need it):
- Your existing local accounts

## 📋 Step-by-Step Instructions:

### 1. Create .env File
```bash
# In your project directory
cat > .env << EOF
MONGODB_URI=mongodb+srv://fabrianorriel_db_user:gsapdslgsKI8ZFDu@cluster0.ffganpu.mongodb.net/chils_korean_store?retryWrites=true&w=majority
NODE_ENV=production
EOF
```

### 2. Install Dependencies (if needed)
```bash
npm install
```

### 3. Run User Creation Script
```bash
npm run create-users
```

### 4. Verify Accounts Created
You should see success messages with the login credentials.

### 5. Test Login on Render
Go to `https://chils-korean-store.onrender.com/auth/login` and try:
- Email: `admin@chils.com`
- Password: `Admin123`

## 🚨 Troubleshooting:

### If Script Fails:
1. **Check MongoDB Connection**: 
   ```bash
   node -e "
   const mongoose = require('mongoose');
   mongoose.connect(process.env.MONGODB_URI)
   .then(() => console.log('✅ DB connection works'))
   .catch(err => console.log('❌ DB connection failed:', err.message));
   "
   ```

2. **Check Environment Variables**:
   ```bash
   echo $MONGODB_URI
   ```

3. **Verify MongoDB Atlas Access**:
   - Go to MongoDB Atlas
   - Check IP whitelist includes `0.0.0.0/0`
   - Verify user credentials

### If Login Still Fails:
1. **Check Render Logs** for database connection errors
2. **Verify Environment Variables** in Render dashboard
3. **Ensure MongoDB Atlas is accessible**

## 🎉 Success!
After running the script, you'll have:
✅ Admin account for store management  
✅ Customer account for testing  
✅ Same credentials as localhost  
✅ Ready to use on production!  

**Your Chil's Korean Store will be fully functional with admin and customer access!** 🚀
