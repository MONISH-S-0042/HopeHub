const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userType: { type: String, enum: ['individual', 'organization', 'poc'], default: 'individual' },
  address: String,
  landmark: String,
  district: String,
  state: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
  category: { type: String, required: true },
  specificResource: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'units' },
  urgency: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  neededBy: Date,
  deliveryPreference: { type: String, enum: ['delivery', 'pickup', 'either'], default: 'either' },
  peopleAffected: Number,
  specialRequirements: String,
  status: { type: String, enum: ['active', 'pending-verification', 'matched', 'fulfilled', 'cancelled'], default: 'active' },
  fulfilledQuantity: { type: Number, default: 0 },
  matchedDonations: [{ type: String }],
  assignedPOC: {
    id: String,
    name: String,
    email: String,
  },
  notifiedPOC: { type: Boolean, default: false },
  rejectionReason: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RequestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Request', RequestSchema);

