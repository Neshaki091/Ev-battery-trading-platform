
// src/controllers/analytics.controller.js
const DailyStats = require('../models/DailyStats.model');
const moment = require('moment');

// Lấy số liệu thống kê tổng hợp (Chỉ Admin)
exports.getStatsSummary = async (req, res) => {
    // ⚠️ Đã kiểm tra quyền Admin qua adminMiddleware
    try {
        // Đọc period từ query (mặc định là 'month')
        const period = req.query.period || 'month';
        const reqMonth = parseInt(req.query.month) - 1; // Moment tháng (0-11)
        const reqYear = parseInt(req.query.year);

        // Xây dựng startDate và endDate
        let startDate, endDate;
        
        if (period === 'today') {
            startDate = moment().startOf('day');
            endDate = moment().endOf('day');
        } else if (period === 'week') {
            startDate = moment().startOf('week');
            endDate = moment().endOf('week');
        } else if (period === 'month' && reqMonth >= 0 && reqYear) {
            startDate = moment({ year: reqYear, month: reqMonth }).startOf('month');
            endDate = moment({ year: reqYear, month: reqMonth }).endOf('month');
        } else if (period === 'month') {
            // Nếu không có month/year, dùng tháng hiện tại
            startDate = moment().startOf('month');
            endDate = moment().endOf('month');
        } else if (period === 'year' && reqYear) {
            startDate = moment({ year: reqYear }).startOf('year');
            endDate = moment({ year: reqYear }).endOf('year');
        } else if (period === 'year') {
            // Nếu không có year, dùng năm hiện tại
            startDate = moment().startOf('year');
            endDate = moment().endOf('year');
        } else if (period === 'all') {
            // Không cần startDate/endDate
            startDate = null;
            endDate = null;
        }

        // Xây dựng matchQuery
        const matchQuery = (startDate && endDate) 
            ? { date: { $gte: startDate.toDate(), $lte: endDate.toDate() } } 
            : {};

        // Truy vấn 1: Lấy summary (Tổng hợp) sử dụng Aggregation
        const summaryResult = await DailyStats.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalNewUsers: { $sum: '$newUsers' },
                    totalNewListings: { $sum: '$newListings' },
                    totalRevenue: { $sum: '$totalRevenue' },
                    totalCommission: { $sum: '$totalCommission' },
                    totalTransactions: { $sum: '$totalTransactions' },
                    totalReviews: { $sum: '$totalReviews' },
                    totalWishlistAdds: { $sum: '$totalWishlistAdds' },
                    totalReports: { $sum: '$totalReports' }
                }
            }
        ]);

        const summary = summaryResult[0] || {
            totalNewUsers: 0,
            totalNewListings: 0,
            totalRevenue: 0,
            totalCommission: 0,
            totalTransactions: 0,
            totalReviews: 0,
            totalWishlistAdds: 0,
            totalReports: 0
        };

        // Xác định dataGrouping
        let dataGrouping = 'daily';
        if (period === 'year' || period === 'all') {
            dataGrouping = 'monthly';
        }

        // Truy vấn 2: Lấy chartData (Dữ liệu biểu đồ)
        let chartData = [];

        if (dataGrouping === 'monthly') {
            // Group theo tháng
            const monthlyData = await DailyStats.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
                        newUsers: { $sum: '$newUsers' },
                        newListings: { $sum: '$newListings' },
                        totalRevenue: { $sum: '$totalRevenue' },
                        totalCommission: { $sum: '$totalCommission' },
                        totalTransactions: { $sum: '$totalTransactions' },
                        totalReviews: { $sum: '$totalReviews' },
                        totalWishlistAdds: { $sum: '$totalWishlistAdds' },
                        totalReports: { $sum: '$totalReports' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            chartData = monthlyData.map(item => ({
                ...item,
                date: new Date(item._id + '-01') // Tạo date từ _id (format: 'YYYY-MM')
            }));
        } else {
            // daily: Lấy dữ liệu theo ngày
            const dailyData = await DailyStats.find(matchQuery).sort({ date: 1 });
            chartData = dailyData.map(item => item.toObject());
        }

        res.status(200).json({
            success: true,
            summary: summary,
            chartData: chartData,
            dataGrouping: dataGrouping
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};