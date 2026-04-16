const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true },
  type:        { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  value:       { type: Number, required: true },
  minOrder:    { type: Number, default: 0 },
  maxDiscount: Number,
  usageLimit:  Number,
  usedCount:   { type: Number, default: 0 },
  users:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt:   Date,
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);