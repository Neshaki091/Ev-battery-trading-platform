const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['xe', 'pin'], required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: String,
  // Thêm fields khác (e.g., hãng, dung lượng pin, từ schema PlantUML)
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);  // Đăng ký model 'Listing'