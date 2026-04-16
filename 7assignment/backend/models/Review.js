const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   String,
  comment: { type: String, required: true },
  images:  [String],
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  verified: { type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Auto-update product rating
reviewSchema.statics.calcAverageRating = async function (productId) {
  const Product = require('./Product');
  const result = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(result[0].avg * 10) / 10,
      'ratings.count': result[0].count,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);