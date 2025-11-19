
// src/models/DailyStats.model.js
const mongoose = require('mongoose');

const DailyStatsSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        required: true, 
        unique: true,
        index: true 
    },
    // Metrics từ Auth Service
    newUsers: { type: Number, default: 0 },

    // Metrics từ Listing Service
    newListings: { type: Number, default: 0 },
    activeListings: { type: Number, default: 0 }, // Cập nhật định kỳ hoặc qua event

    // Metrics từ Transaction Service
    totalRevenue: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    totalTransactions: { type: Number, default: 0 },

    // Metrics từ Review Service
    totalReviews: { type: Number, default: 0 },
    totalRatingSum: { type: Number, default: 0 },

    // Metrics từ Wishlist Service
    totalWishlistAdds: { type: Number, default: 0 },

    // Metrics từ Report Service
    totalReports: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('DailyStats', DailyStatsSchema);