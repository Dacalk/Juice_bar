const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./utils/db');
const { User, Product, Order } = require('./utils/models');

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());

// Helper to map _id to id in responses
const transform = (doc, ret) => {
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
};

// Apply transform to schemas
User.schema.set('toJSON', { transform });
Product.schema.set('toJSON', { transform });
Order.schema.set('toJSON', { transform });

// Middleware to verify JWT
const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send({ error: 'Not authorized' });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findOne({ _id: data._id });
    if (!user) throw new Error();
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Not authorized' });
  }
};

// --- Auth Endpoints ---

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ detail: 'Invalid credentials' });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'secret');
    res.send({ access_token: token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ error: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({
      username,
      password: hashedPassword,
      role: role || 'cashier'
    });
    await user.save();
    res.status(201).send({ message: 'User created successfully', user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(400).send(error);
  }
});

// --- User Endpoints ---

router.get('/users', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
  const users = await User.find({}, '-password');
  res.send(users);
});

router.post('/users', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/users/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send({ message: 'User deleted' });
  } catch (error) {
    res.status(400).send(error);
  }
});

// --- Product Endpoints ---

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.post('/products', auth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put('/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(product);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/products/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.send({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).send(error);
  }
});

// --- Order Endpoints ---

router.post('/orders', auth, async (req, res) => {
  try {
    const { items, total } = req.body;
    
    // Fetch products to get cost prices and actual info
    const productIds = items.map(i => i.product_id);
    const products = await Product.find({ _id: { $in: productIds } });
    
    let totalCost = 0;
    const enrichedItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.product_id);
      let cost = 0;
      
      if (product) {
        if (product.category === 'Gram Section') {
          const unitGrams = parseFloat(product.unit) || 100;
          cost = (product.cost_price / unitGrams) * item.quantity;
        } else {
          cost = product.cost_price * item.quantity;
        }
      }
      totalCost += cost;
      
      return {
        ...item,
        name: product ? product.name : 'Unknown Item',
        cost_price: product ? product.cost_price : 0,
        subtotal: item.price * item.quantity
      };
    });

    const order = new Order({
      items: enrichedItems,
      total,
      cost: totalCost,
      profit: total - totalCost,
      invoice_number: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      cashier: req.user.username
    });

    await order.save();
    res.status(201).send(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).send({ error: error.message });
  }
});

// --- Report Endpoints ---

router.get('/reports/daily', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send({ error: 'Access denied' });
  
  try {
    const { start_date, end_date } = req.query;
    let query = {};
    
    if (start_date || end_date) {
      query.timestamp = {};
      if (start_date) query.timestamp.$gte = new Date(start_date);
      if (end_date) {
        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    } else {
      // Default to today
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      query.timestamp = { $gte: start, $lte: end };
    }

    const orders = await Order.find(query).sort({ timestamp: -1 });
    
    const stats = orders.reduce((acc, order) => {
      acc.total_sales += order.total;
      acc.total_cost += order.cost;
      acc.total_profit += order.profit;
      return acc;
    }, { total_sales: 0, total_cost: 0, total_profit: 0 });

    res.send({
      ...stats,
      num_orders: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.use('/.netlify/functions/api', router);
app.use('/api', router);
app.use('/', router);

// Export app for local dev
module.exports = app;

module.exports.handler = async (event, context) => {
  await connectDB();
  return serverless(app)(event, context);
};
