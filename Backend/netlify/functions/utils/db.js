const mongoose = require('mongoose');

// dotenv is needed for local dev, Netlify uses system env variables automatically
require('dotenv').config(); 

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined in environment');
    
    // Serverless optimization: shorter timeout and IPv4 family
    await mongoose.connect(uri, { 
      family: 4,
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of hanging
    });
    
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

module.exports = connectDB;
