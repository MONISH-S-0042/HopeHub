const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  type: { type: String, enum: ['individual', 'organization', 'poc'], default: 'individual' },
  phone: String,
  isVerified: { type: Boolean, default: false },
  trustScore: { type: Number, default: 0 },
  organizationName: String,
  organizationType: String,
  specialization: String,
  district: String,
  state: String,
  designation: String,
  officeHours: String,
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

UserSchema.methods.validatePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
