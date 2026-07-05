// Simple test to verify MongoDB connection
require('dotenv').config();
const connectDB = require('./config/db');

async function testConnection() {
  console.log('Testing MongoDB connection...\n');
  
  try {
    await connectDB();
    console.log('\n✅ MongoDB connection test successful!');
    console.log('You can now start your server with: npm start');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB connection test failed!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure MongoDB is running: net start MongoDB (Windows) or sudo systemctl start mongod (Linux)');
    console.error('2. Check MONGO_URI in .env file');
    console.error('3. Verify MongoDB is installed');
    process.exit(1);
  }
}

testConnection();
