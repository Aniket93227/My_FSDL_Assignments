const mongoose = require('mongoose');

const specSchema = new mongoose.Schema({
  key:   String,
  value: String,
}, { _id: false });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  description: { type: String, required: true },
  shortDesc:   String,
  price:       { type: Number, required: true, min: 0 },
  comparePrice:Number,
  discount:    { type: Number, default: 0 },
  category:    { type: String, required: true, index: true },
  brand:       { type: String, required: true, index: true },
  model:       String,
  images:      [{ url: String, public_id: String }],
  stock:       { type: Number, required: true, default: 0 },
  sold:        { type: Number, default: 0 },
  specs:       [specSchema],
  tags:        [String],
  featured:    { type: Boolean, default: false },
  trending:    { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  ratings: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 },
  },
  warranty:    String,
  sku:         { type: String, unique: true },
  weight:      Number,
  dimensions:  { length: Number, width: Number, height: Number },
}, { timestamps: true });

// Auto-generate slug
productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
});

// Full-text search index
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);