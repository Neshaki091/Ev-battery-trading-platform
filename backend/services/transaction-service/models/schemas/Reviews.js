const mongoose = require('mongoose');

const reviewsSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  title: String,
  comment: String,
  type: { type: String, enum: ['review', 'question'] },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reviews' }, // Self-ref
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Reviews', reviewsSchema);