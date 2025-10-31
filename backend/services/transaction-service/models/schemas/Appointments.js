const mongoose = require('mongoose');

const appointmentsSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startDateTime: { type: Date, required: true },
  timezone: String,
  type: { type: String, enum: ['physical', 'virtual'], required: true },
  address: String,
  lat: Number,
  lng: Number,
  status: { type: String, enum: ['requested', 'confirmed', 'cancelled'], default: 'requested' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Appointments', appointmentsSchema);