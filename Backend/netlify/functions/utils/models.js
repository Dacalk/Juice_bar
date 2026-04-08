const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'cashier'], default: 'cashier' }
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  cost_price: { type: Number, default: 0 },
  category: { type: String, default: 'Other' },
  unit: { type: String, default: 'pc' },
  image: { type: String, default: '🥤' },
  stock: { type: Number, default: 0 }
});

const OrderSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  items: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    cost_price: Number,
    quantity: Number,
    subtotal: Number
  }],
  total: { type: Number, required: true },
  cost: { type: Number, required: true },
  profit: { type: Number, required: true },
  invoice_number: { type: String, required: true, unique: true },
  cashier: String
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Product: mongoose.model('Product', ProductSchema),
  Order: mongoose.model('Order', OrderSchema)
};
