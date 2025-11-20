const mongoose = require('mongoose');


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
  commissionAmount: { type: Number, default: 0 },
  // 🆕 BỔ SUNG: Thông tin thanh toán từ Casso webhook
  cassoPayment: {
    transId: { type: String },
    description: { type: String },
    amount: { type: Number },
    bankCode: { type: String },
    paidAt: { type: Date },
    raw: { type: mongoose.Schema.Types.Mixed }
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);