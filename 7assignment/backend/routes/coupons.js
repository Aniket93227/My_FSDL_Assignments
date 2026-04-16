const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/validate', protect, async (req, res) => {
  const { code, totalPrice } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon' });
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return res.status(400).json({ success: false, message: 'Coupon expired' });
  if (totalPrice < coupon.minOrder)
    return res.status(400).json({ success: false, message: `Min order ₹${coupon.minOrder}` });
  const discount = coupon.type === 'percent'
    ? Math.min(totalPrice * coupon.value / 100, coupon.maxDiscount || Infinity)
    : coupon.value;
  res.json({ success: true, coupon, discount: Math.round(discount) });
});

router.post('/', protect, admin, async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

router.get('/', protect, admin, async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, coupons });
});

router.delete('/:id', protect, admin, async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;