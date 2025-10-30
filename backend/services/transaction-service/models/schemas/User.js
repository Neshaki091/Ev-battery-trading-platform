const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  role: { type: String, enum: ['guest', 'member', 'admin'], default: 'member' },
  // Thêm fields khác từ schema PlantUML nếu cần (e.g., socialProviders)
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);  // Đăng ký model 'User'