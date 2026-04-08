const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Bypass local DNS issues

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') }); // Adjusted for Backend/netlify/functions/utils/

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined in environment');
    await mongoose.connect(uri, { family: 4 });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

module.exports = connectDB;
