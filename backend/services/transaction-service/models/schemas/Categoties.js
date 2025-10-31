const mongoose = require('mongoose');

const categoriesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, enum: ['ev_brand', 'battery_type'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categories' },
  description: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Categories', categoriesSchema);