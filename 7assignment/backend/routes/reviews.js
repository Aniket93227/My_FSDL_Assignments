const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

router.get('/product/:productId', async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort('-createdAt');
  res.json({ success: true, reviews });
});

router.post('/', protect, async (req, res) => {
  try {
    const { product, rating, title, comment } = req.body;
    const existing = await Review.findOne({ product, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });
    const review = await Review.create({ product, user: req.user._id, rating, title, comment });
    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id/helpful', protect, async (req, res) => {
  const review = await Review.findById(req.params.id);
  const idx = review.helpful.indexOf(req.user._id);
  if (idx === -1) review.helpful.push(req.user._id);
  else review.helpful.splice(idx, 1);
  await review.save();
  res.json({ success: true, helpfulCount: review.helpful.length });
});

router.delete('/:id', protect, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Not authorized' });
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
});

module.exports = router;