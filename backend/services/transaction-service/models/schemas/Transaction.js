const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Buyer
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Seller
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['xe', 'pin'], required: true },
  status: { type: String, enum: ['pending', 'paid', 'completed', 'cancelled'], default: 'pending' },
  paidAt: { type: Date },

  // Commission/Fee fields
  commissionRate: { type: Number, default: 0.05 },
  commissionAmount: { type: Number, default: 0 },

  // Casso payment info
  cassoPayment: {
    transId: { type: String },
    description: { type: String },
    amount: { type: Number },
    bankCode: { type: String },
    paidAt: { type: Date },
    raw: { type: mongoose.Schema.Types.Mixed }
  },

  // Seller payment info
  sellerPayment: {
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    amount: { type: Number }, // Actual amount to seller (price - commission)
    paidAt: { type: Date },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who confirmed
    transactionRef: { type: String }, // Bank transfer reference
    notes: { type: String }
  },

  // Electronic signatures
  buyerSignature: {
    signedAt: { type: Date },
    deviceInfo: { type: String }
  },
  sellerSignature: {
    signedAt: { type: Date },
    deviceInfo: { type: String }
  }
}, { timestamps: true });

// Helper method: Check if user is seller
transactionSchema.methods.isSeller = function (userId) {
  return String(this.sellerId) === String(userId);
};

// Helper method: Check if user is buyer
transactionSchema.methods.isBuyer = function (userId) {
  return String(this.userId) === String(userId);
};

// Helper method: Get user role in transaction
transactionSchema.methods.getUserRole = function (userId) {
  if (this.isSeller(userId)) return 'seller';
  if (this.isBuyer(userId)) return 'buyer';
  return null;
};

// Helper method: Check if user can cancel
transactionSchema.methods.canCancel = function (userId) {
  // Seller can cancel if status is 'pending' (not yet paid)
  if (this.isSeller(userId) && this.status === 'pending') {
    return true;
  }
  // Buyer cannot cancel after creating transaction
  return false;
};

// Helper method: Check if user can message
transactionSchema.methods.canMessage = function (userId) {
  // Both seller and buyer can message
  return this.isSeller(userId) || this.isBuyer(userId);
};

// Virtual: Get filtered data for seller view
transactionSchema.methods.toSellerView = function () {
  return {
    _id: this._id,
    buyerId: this.userId,
    listingId: this.listingId,
    price: this.price,
    type: this.type,
    status: this.status,
    paidAt: this.paidAt,
    commissionAmount: this.commissionAmount,
    sellerPayment: this.sellerPayment,
    buyerSignature: this.buyerSignature,
    sellerSignature: this.sellerSignature,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    role: 'seller',
    canCancel: this.status === 'pending',
    canMessage: true
  };
};

// Virtual: Get filtered data for buyer view
transactionSchema.methods.toBuyerView = function () {
  return {
    _id: this._id,
    sellerId: this.sellerId,
    listingId: this.listingId,
    price: this.price,
    type: this.type,
    status: this.status,
    paidAt: this.paidAt,
    cassoPayment: this.cassoPayment,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    role: 'buyer',
    canCancel: false,
    canMessage: true,
    buyerSignature: this.buyerSignature,
    sellerSignature: this.sellerSignature
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);