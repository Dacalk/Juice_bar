const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { User, Product } = require('./netlify/functions/utils/models');

const seedAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined in environment');
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 8);
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created successfully (username: admin, password: admin123)');
    }

    // Seed sample products if none exist
    const existingProducts = await Product.find({});
    if (existingProducts.length === 0) {
      const sampleProducts = [
        { name: 'Apple Juice', price: 250, cost_price: 150, category: 'Juices', image: '🍎' },
        { name: 'Orange Juice', price: 300, cost_price: 200, category: 'Juices', image: '🍊' },
        { name: 'Mango Blast', price: 400, cost_price: 250, category: 'Juices', image: '🥭' }
      ];
      await Product.insertMany(sampleProducts);
      console.log('Sample products created successfully');
    }

  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
