const mongoose = require('mongoose');

const conversationsSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  lastMessageAt: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Conversations', conversationsSchema);