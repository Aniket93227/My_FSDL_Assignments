require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

const PRODUCTS = [
  { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Smartphones', price: 109999, comparePrice: 129999, stock: 50, featured: true, trending: true, description: 'The ultimate Android flagship with S Pen and 200MP camera.', specs: [{ key: 'RAM', value: '12GB' }, { key: 'Storage', value: '256GB' }, { key: 'Display', value: '6.8" Dynamic AMOLED' }], images: [{ url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800' }], sku: 'SAM-S24U', warranty: '1 Year' },
  { name: 'Apple MacBook Pro 16" M3', brand: 'Apple', category: 'Laptops', price: 249999, comparePrice: 269999, stock: 25, featured: true, description: 'M3 Pro chip with 18-hour battery life.', specs: [{ key: 'Chip', value: 'M3 Pro' }, { key: 'RAM', value: '18GB' }, { key: 'SSD', value: '512GB' }], images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800' }], sku: 'APL-MBP16', warranty: '1 Year' },
  { name: 'Sony WH-1000XM5 Headphones', brand: 'Sony', category: 'Audio', price: 29999, comparePrice: 34999, stock: 80, trending: true, description: 'Industry-leading noise cancelling with 30-hour battery.', specs: [{ key: 'Driver', value: '30mm' }, { key: 'Battery', value: '30 hours' }, { key: 'ANC', value: 'Yes' }], images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800' }], sku: 'SNY-WH5', warranty: '1 Year' },
  { name: 'LG OLED C3 65" 4K TV', brand: 'LG', category: 'TV', price: 169999, comparePrice: 200000, stock: 15, featured: true, description: 'Perfect blacks and infinite contrast with OLED technology.', specs: [{ key: 'Display', value: '65" OLED 4K' }, { key: 'Refresh Rate', value: '120Hz' }, { key: 'HDR', value: 'Dolby Vision' }], images: [{ url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=800' }], sku: 'LG-C365', warranty: '2 Years' },
  { name: 'Apple iPad Pro 12.9" M2', brand: 'Apple', category: 'Tablets', price: 99999, comparePrice: 109999, stock: 35, featured: true, description: 'Liquid Retina XDR display with M2 chip performance.', specs: [{ key: 'Chip', value: 'M2' }, { key: 'Display', value: '12.9" Liquid Retina XDR' }, { key: 'Storage', value: '256GB' }], images: [{ url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800' }], sku: 'APL-IPDP12', warranty: '1 Year' },
  { name: 'OnePlus 12 5G', brand: 'OnePlus', category: 'Smartphones', price: 64999, comparePrice: 69999, stock: 60, trending: true, description: 'Snapdragon 8 Gen 3 with 100W SUPERVOOC charging.', specs: [{ key: 'RAM', value: '16GB' }, { key: 'Storage', value: '256GB' }, { key: 'Charging', value: '100W' }], images: [{ url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800' }], sku: 'OP-12-5G', warranty: '1 Year' },
];

async function seed() {
  await connectDB();
  await User.deleteMany();
  await Product.deleteMany();

  await User.create([
    { name: 'Admin User', email: 'admin@voltstore.com', password: 'admin123', role: 'admin', isVerified: true },
    { name: 'John Doe', email: 'john@example.com', password: 'user1234', role: 'user', isVerified: true },
  ]);

  for (const p of PRODUCTS) {
    p.slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await Product.create(p);
  }

  console.log('✅ Database seeded!');
  console.log('Admin: admin@voltstore.com / admin123');
  process.exit();
}

seed().catch(console.error);