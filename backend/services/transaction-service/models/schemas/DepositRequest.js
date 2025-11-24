const mongoose = require('mongoose');

const DepositRequestSchema = new mongoose.Schema({
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
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    paymentMethod: {
        type: String,
        default: 'bank_transfer'
    },
    bankTransferInfo: {
        bankName: String,
        accountNumber: String,
        accountName: String,
        transactionRef: String,
        transferDate: Date,
        proofImageUrl: String, // URL to uploaded proof
        note: String
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: Date,
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
DepositRequestSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for better query performance
DepositRequestSchema.index({ userId: 1, status: 1 });
DepositRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('DepositRequest', DepositRequestSchema);
