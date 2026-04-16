const express = require('express');
const router = express.Router();
const WishlistModel = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  let w = await WishlistModel.findOne({ user: req.user._id }).populate('products');
  res.json({ success: true, wishlist: w?.products || [] });
});

router.post('/toggle/:productId', protect, async (req, res) => {
  let w = await WishlistModel.findOne({ user: req.user._id });
  if (!w) w = new WishlistModel({ user: req.user._id, products: [] });
  const idx = w.products.indexOf(req.params.productId);
  if (idx === -1) w.products.push(req.params.productId);
  else w.products.splice(idx, 1);
  await w.save();
  res.json({ success: true, added: idx === -1 });
});

module.exports = router;