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
  cassoPayment: {
    transId: { type: String },
    description: { type: String },
    amount: { type: Number },
    bankCode: { type: String },
    paidAt: { type: Date },
    raw: { type: mongoose.Schema.Types.Mixed }
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);