const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     String,
  price:    Number,
  quantity: { type: Number, default: 1 },
  image:    String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems:    [orderItemSchema],
  shippingAddress: {
    street:  String,
    city:    String,
    state:   String,
    zip:     String,
    country: String,
    phone:   String,
  },
  paymentMethod:  { type: String, default: 'stripe' },
  paymentResult: {
    id:       String,
    status:   String,
    updateTime: String,
    emailAddress: String,
  },
  itemsPrice:    Number,
  shippingPrice: { type: Number, default: 0 },
  taxPrice:      { type: Number, default: 0 },
  totalPrice:    Number,
  couponCode:    String,
  discount:      { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'],
    default: 'pending',
  },
  isPaid:        { type: Boolean, default: false },
  paidAt:        Date,
  isDelivered:   { type: Boolean, default: false },
  deliveredAt:   Date,
  trackingNumber: String,
  notes:         String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);  