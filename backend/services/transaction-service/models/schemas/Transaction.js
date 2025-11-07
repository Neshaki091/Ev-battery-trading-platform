const mongoose = require('mongoose');

// Import models trước khi dùng ref (để register)
const User = require('./User');
const Listing = require('./Listing');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['xe', 'pin'], required: true },
  status: { type: String, enum: ['pending', 'paid', 'completed', 'cancelled'], default: 'pending' },
  paidAt: { type: Date },
  // BỔ SUNG: Fields liên quan đến phí/hoa hồng
  commissionRate: { type: Number, default: 0.05 },
  commissionAmount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);