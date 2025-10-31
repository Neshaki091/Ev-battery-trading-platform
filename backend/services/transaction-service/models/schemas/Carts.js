const mongoose = require('mongoose');

const cartsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    quantity: { type: Number, default: 1 }
  }],
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'abandoned'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Carts', cartsSchema);