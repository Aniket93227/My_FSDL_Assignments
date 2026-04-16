const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, couponCode, notes } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || !cart.items.length)
      return res.status(400).json({ success: false, message: 'Cart is empty' });

    let itemsPrice = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (itemsPrice >= coupon.minOrder) {
          discount = coupon.type === 'percent'
            ? Math.min(itemsPrice * coupon.value / 100, coupon.maxDiscount || Infinity)
            : coupon.value;
          coupon.usedCount += 1;
          coupon.users.push(req.user._id);
          await coupon.save();
        }
      }
    }

    const shippingPrice = itemsPrice > 1000 ? 0 : 99;
    const taxPrice = Math.round((itemsPrice - discount) * 0.18 * 100) / 100;
    const totalPrice = Math.round((itemsPrice - discount + shippingPrice + taxPrice) * 100) / 100;

    const orderItems = cart.items.map(i => ({
      product: i.product._id,
      name: i.product.name,
      price: i.price,
      quantity: i.quantity,
      image: i.product.images[0]?.url || '',
    }));

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      discount,
      totalPrice,
      couponCode,
      notes,
    });

    // Update stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stripe payment intent
router.post('/create-payment-intent', protect, async (req, res) => {
  const { amount } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'inr',
    metadata: { userId: req.user._id.toString() },
  });
  res.json({ success: true, clientSecret: paymentIntent.client_secret });
});

// Confirm payment
router.put('/:id/pay', protect, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.isPaid = true;
  order.paidAt = new Date();
  order.status = 'confirmed';
  order.paymentResult = req.body;
  await order.save();
  res.json({ success: true, order });
});

// My orders
router.get('/my', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, orders });
});

// Single order
router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, order });
});

// Admin: all orders
router.get('/', protect, admin, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};
  const orders = await Order.find(query)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate('user', 'name email');
  const total = await Order.countDocuments(query);
  res.json({ success: true, orders, total });
});

// Admin: update order status
router.put('/:id/status', protect, admin, async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, trackingNumber: req.body.trackingNumber },
    { new: true }
  );
  res.json({ success: true, order });
});

module.exports = router;