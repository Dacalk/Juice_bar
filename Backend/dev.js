const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('./netlify/functions/utils/db');
const app = require('./netlify/functions/api');

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    const server = express();
    server.use(cors());
    server.use(express.json());
    
    // Mount the app at /api for convenience as the frontend uses that
    server.use('/api', app);

    server.listen(PORT, () => {
      console.log(`Backend Dev Server running on http://localhost:${PORT}`);
      console.log(`API base path: http://localhost:${PORT}/.netlify/functions/api`);
    });
  } catch (err) {
    console.error('Failed to start backend:', err);
  }
};

startServer();
