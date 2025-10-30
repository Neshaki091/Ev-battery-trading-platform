// src/models/listing.js
const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
    listing_id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, text: true },
    description: { type: String, required: true, text: true },
    type: { type: String, enum: ['XE', 'PIN'], required: true },
    status: { type: String, enum: ['pending', 'approved', 'sold', 'expired'], default: 'pending', index: true },
    price: { type: Number, required: true, index: true },
    location: { type: String, index: true },
    vehicle: {
        brand: { type: String, index: true },
        model: { type: String, index: true },
        manufacturing_year: { type: Number },
        mileage_km: { type: Number, index: true }
    },
    battery: {
        capacity_kwh: { type: Number, index: true },
        condition_percentage: { type: Number, index: true }
    },
    seller: {
        user_id: { type: Number, required: true },
        name: { type: String, required: true },
        is_verified: { type: Boolean, default: false }
    },
    images: [String]
}, { timestamps: true });

ListingSchema.index({ title: 'text', description: 'text' });

// module.exports = mongoose.model('Listing', ListingSchema);
module.exports = mongoose.model('Listing', ListingSchema, 'search');
