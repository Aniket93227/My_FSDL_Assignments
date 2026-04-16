const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

router.use(protect, admin);

router.get('/stats', async (req, res) => {
  const [totalOrders, totalProducts, totalUsers, revenue, recentOrders] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user' }),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
  ]);

  // Revenue per month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyRevenue = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
    { $group: {
      _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
      revenue: { $sum: '$totalPrice' },
      orders: { $sum: 1 },
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const topProducts = await Product.find().sort('-sold').limit(5);

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: revenue[0]?.total || 0,
      recentOrders,
      monthlyRevenue,
      topProducts,
    },
  });
});

router.get('/users', async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, users });
});

router.put('/users/:id/role', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  res.json({ success: true, user });
});

module.exports = router;