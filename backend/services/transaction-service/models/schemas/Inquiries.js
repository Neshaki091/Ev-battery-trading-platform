const mongoose = require('mongoose');

const inquiriesSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  askerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  type: { type: String, enum: ['general', 'price'], default: 'general' },
  status: { type: String, enum: ['open', 'replied'], default: 'open' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiries' }, // Self-ref
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Inquiries', inquiriesSchema);