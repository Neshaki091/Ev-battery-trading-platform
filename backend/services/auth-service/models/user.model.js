const mongoose = require('mongoose');
const tokenSchema = require('./token.model');

const userSchema = new mongoose.Schema({
    profile: {
        username: { type: String, default: '' },
        email: { type: String, required: true, unique: true},
        // Sửa lỗi: Chỉ giữ lại 1 trường createdAt
        phonenumber: { type: String, required: true, unique: true },
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
    },
    wallet: {
        bankName: { type: String, default: '' },
        bankCode: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        accountName: { type: String, default: '' },
        branch: { type: String, default: '' },
    },
    createdAt: { type: Date, default: Date.now }, // Đặt createdAt ở đây, áp dụng cho toàn bộ User
    password: { type: String, required: true },
    // Thêm trường isActive để hỗ trợ khóa/vô hiệu hóa tài khoản (Thiếu sót từ lần trước)
    isActive: { type: Boolean, default: true }, 
    role: { type: String, enum: ['user', 'admin', 'guest'], default: 'user' },
    Tokens: [tokenSchema], // Sửa tên trường thành 'Tokens' cho nhất quán
    matchedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Sửa chính tả
});

module.exports = mongoose.model('User', userSchema);