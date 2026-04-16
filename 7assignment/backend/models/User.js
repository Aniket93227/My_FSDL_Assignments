const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar:   { type: String, default: '' },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  phone:    String,
  addresses: [{
    label:    String,
    street:   String,
    city:     String,
    state:    String,
    zip:      String,
    country:  { type: String, default: 'India' },
    isDefault: Boolean,
  }],
  isVerified:  { type: Boolean, default: false },
  resetPasswordToken:   String,
  resetPasswordExpire:  Date,
  lastLogin:  Date,
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);