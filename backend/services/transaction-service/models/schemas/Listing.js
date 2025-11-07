const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['xe', 'pin'], required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Field thực tế trong DB
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Giữ lại cho compatibility
  description: String,
  category: String,
  condition: String,
  location: String,
  status: { type: String, enum: ['Pending', 'Active', 'Sold', 'Inactive'], default: 'Pending' },
  isVerified: { type: Boolean, default: false },
  // Thêm fields khác (e.g., hãng, dung lượng pin, từ schema PlantUML)
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);  // Đăng ký model 'Listing'