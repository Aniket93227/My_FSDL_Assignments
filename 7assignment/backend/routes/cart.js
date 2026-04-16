const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Get cart
router.get('/', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  res.json({ success: true, cart: cart || { items: [] } });
});

// Add to cart
router.post('/add', protect, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.stock < quantity)
    return res.status(400).json({ success: false, message: 'Insufficient stock' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find(i => i.product.toString() === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
  } else {
    cart.items.push({ product: productId, quantity, price: product.price });
  }
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, cart });
});

// Update quantity
router.put('/update', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
  const item = cart.items.find(i => i.product.toString() === productId);
  if (item) item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, cart });
});

// Remove item
router.delete('/remove/:productId', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate('items.product');
  res.json({ success: true, cart });
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = router;