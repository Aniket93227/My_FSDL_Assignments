const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET all products (with filtering, sorting, pagination, search)
router.get('/', async (req, res) => {
  try {
    const {
      search, category, brand, minPrice, maxPrice,
      sort = '-createdAt', page = 1, limit = 12,
      featured, trending, inStock,
    } = req.query;

    const query = { isActive: true };
    if (search)    query.$text = { $search: search };
    if (category)  query.category = { $in: category.split(',') };
    if (brand)     query.brand = { $in: brand.split(',') };
    if (featured)  query.featured = true;
    if (trending)  query.trending = true;
    if (inStock)   query.stock = { $gt: 0 };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Get unique filter options
    const [brands, categories] = await Promise.all([
      Product.distinct('brand', { isActive: true }),
      Product.distinct('category', { isActive: true }),
    ]);

    res.json({
      success: true,
      products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      brands,
      categories,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET related products
router.get('/:id/related', async (req, res) => {
  const product = await Product.findById(req.params.id);
  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(4);
  res.json({ success: true, products: related });
});

// POST create (admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update (admin)
router.put('/:id', protect, admin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, product });
});

// DELETE (admin)
router.delete('/:id', protect, admin, async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Product deactivated' });
});

// GET stats for a product
router.get('/:id/stats', protect, admin, async (req, res) => {
  const Review = require('../models/Review');
  const Order = require('../models/Order');
  const [product, reviewCount, orderCount] = await Promise.all([
    Product.findById(req.params.id),
    Review.countDocuments({ product: req.params.id }),
    Order.countDocuments({ 'orderItems.product': req.params.id }),
  ]);
  res.json({ success: true, product, reviewCount, orderCount });
});

module.exports = router;