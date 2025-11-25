const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending',
        index: true
    },
    // Thông tin ngân hàng (copy từ user wallet tại thời điểm tạo request)
    bankInfo: {
        bankName: String,
        bankCode: String,
        accountNumber: String,
        accountName: String,
        branch: String
    },
    // Admin xử lý
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: Date,
    // Mã giao dịch chuyển khoản
    transactionRef: String,
    // Ghi chú từ user
    note: String,
    // Ghi chú từ admin (lý do từ chối, v.v.)
    adminNote: String,
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt before save
withdrawalRequestSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
