const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donorName: { type: String, required: true },
    donorType: { type: String, enum: ['individual', 'organization', 'poc'], required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    // Location for pickup
    pickupAddress: String,
    district: String,
    state: String,
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

DonationSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Donation', DonationSchema);
