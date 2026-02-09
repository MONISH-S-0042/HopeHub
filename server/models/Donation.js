const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: false },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donorName: { type: String, required: true },
    donorType: { type: String, enum: ['individual', 'organization', 'poc'], required: true },

    // Resource Details
    category: { type: String, required: true },
    specificResource: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    remainingQuantity: { type: Number, required: true },

    // Condition & Expiry
    condition: { type: String, enum: ['new', 'gently-used', 'consumable'], default: 'new' },
    expiryDate: Date,
    availableUntil: Date,

    // Location for pickup
    pickupAddress: String,
    district: String,
    state: String,

    // Delivery Options
    canDeliver: { type: Boolean, default: false },
    canPickup: { type: Boolean, default: true },
    deliveryRadius: { type: Number, default: 25 },

    status: { type: String, enum: ['pending', 'available', 'matched', 'completed', 'cancelled'], default: 'available' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

DonationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Donation', DonationSchema);
