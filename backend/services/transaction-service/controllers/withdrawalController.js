// controllers/withdrawalController.js
const WithdrawalRequest = require('../models/schemas/WithdrawalRequest');
const axios = require('axios');

/**
 * Seller tạo yêu cầu rút tiền
 * POST /withdrawals/request
 */
exports.createWithdrawalRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amount, note } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Số tiền rút phải lớn hơn 0'
            });
        }

        // Lấy thông tin user từ auth service
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://backend-auth-service-1:3000';
        const token = req.headers.authorization;

        const userResponse = await axios.get(`${authServiceUrl}/userprofile/${userId}`, {
            headers: { Authorization: token }
        });

        const userData = userResponse.data;
        const walletBalance = userData.walletBalance || 0;
        const wallet = userData.wallet || {};

        // Kiểm tra số dư
        if (amount > walletBalance) {
            return res.status(400).json({
                success: false,
                error: `Số dư không đủ. Số dư hiện tại: ${walletBalance.toLocaleString('vi-VN')} đ`
            });
        }

        // Kiểm tra thông tin ngân hàng
        if (!wallet.bankName || !wallet.accountNumber || !wallet.accountName) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng cập nhật đầy đủ thông tin ngân hàng trước khi rút tiền'
            });
        }

        // Kiểm tra xem có request pending nào không
        const pendingRequest = await WithdrawalRequest.findOne({
            userId: userId,
            status: 'pending'
        });

        if (pendingRequest) {
            return res.status(400).json({
                success: false,
                error: 'Bạn đã có yêu cầu rút tiền đang chờ xử lý'
            });
        }

        // Tạo withdrawal request
        const withdrawalRequest = new WithdrawalRequest({
            userId: userId,
            amount: amount,
            bankInfo: {
                bankName: wallet.bankName,
                bankCode: wallet.bankCode,
                accountNumber: wallet.accountNumber,
                accountName: wallet.accountName,
                branch: wallet.branch
            },
            note: note || '',
            status: 'pending'
        });

        await withdrawalRequest.save();

        res.status(201).json({
            success: true,
            message: 'Yêu cầu rút tiền đã được gửi. Admin sẽ xử lý trong vòng 24h.',
            data: withdrawalRequest
        });
    } catch (error) {
        console.error('Error creating withdrawal request:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Lấy danh sách withdrawal requests của user
 * GET /withdrawals/my-requests
 */
exports.getMyWithdrawalRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await WithdrawalRequest.find({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching withdrawal requests:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Admin: Lấy danh sách tất cả withdrawal requests
 * GET /admin/withdrawals/pending
 */
exports.getPendingWithdrawals = async (req, res) => {
    try {
        const requests = await WithdrawalRequest.find({ status: 'pending' })
            .sort({ createdAt: 1 }) // Oldest first
            .limit(100);

        // Lấy thông tin user cho mỗi request
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://backend-auth-service-1:3000';

        const enrichedRequests = await Promise.all(
            requests.map(async (request) => {
                try {
                    const userResponse = await axios.get(
                        `${authServiceUrl}/seller/${request.userId}`,
                        { headers: { 'x-internal-key': process.env.INTERNAL_API_KEY } }
                    );

                    return {
                        ...request.toObject(),
                        user: userResponse.data
                    };
                } catch (error) {
                    return {
                        ...request.toObject(),
                        user: { user_id: request.userId, username: 'Unknown' }
                    };
                }
            })
        );

        res.status(200).json({
            success: true,
            data: enrichedRequests
        });
    } catch (error) {
        console.error('Error fetching pending withdrawals:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Admin: Duyệt withdrawal request
 * POST /admin/withdrawals/:id/approve
 */
exports.approveWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const { transactionRef, adminNote } = req.body;
        const adminId = req.user._id;

        const request = await WithdrawalRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy yêu cầu rút tiền'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Yêu cầu này đã được xử lý'
            });
        }

        // Trừ tiền khỏi ví user
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://backend-auth-service-1:3000';

        try {
            await axios.post(
                `${authServiceUrl}/wallet/deduct`,
                {
                    userId: request.userId.toString(),
                    amount: request.amount
                },
                { headers: { 'x-internal-key': process.env.INTERNAL_API_KEY } }
            );
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'Không thể trừ tiền khỏi ví người dùng: ' + error.message
            });
        }

        // Cập nhật withdrawal request
        request.status = 'completed';
        request.processedBy = adminId;
        request.processedAt = new Date();
        request.transactionRef = transactionRef || '';
        request.adminNote = adminNote || '';

        await request.save();

        res.status(200).json({
            success: true,
            message: 'Đã duyệt yêu cầu rút tiền',
            data: request
        });
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Admin: Từ chối withdrawal request
 * POST /admin/withdrawals/:id/reject
 */
exports.rejectWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;
        const adminId = req.user._id;

        const request = await WithdrawalRequest.findById(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy yêu cầu rút tiền'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Yêu cầu này đã được xử lý'
            });
        }

        request.status = 'rejected';
        request.processedBy = adminId;
        request.processedAt = new Date();
        request.adminNote = adminNote || 'Yêu cầu bị từ chối';

        await request.save();

        res.status(200).json({
            success: true,
            message: 'Đã từ chối yêu cầu rút tiền',
            data: request
        });
    } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Admin: Lấy lịch sử withdrawal
 * GET /admin/withdrawals/history
 */
exports.getWithdrawalHistory = async (req, res) => {
    try {
        const requests = await WithdrawalRequest.find({
            status: { $in: ['completed', 'rejected'] }
        })
            .sort({ processedAt: -1 })
            .limit(100);

        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://backend-auth-service-1:3000';

        const enrichedRequests = await Promise.all(
            requests.map(async (request) => {
                try {
                    const userResponse = await axios.get(
                        `${authServiceUrl}/seller/${request.userId}`,
                        { headers: { 'x-internal-key': process.env.INTERNAL_API_KEY } }
                    );

                    return {
                        ...request.toObject(),
                        user: userResponse.data
                    };
                } catch (error) {
                    return {
                        ...request.toObject(),
                        user: { user_id: request.userId, username: 'Unknown' }
                    };
                }
            })
        );

        res.status(200).json({
            success: true,
            data: enrichedRequests
        });
    } catch (error) {
        console.error('Error fetching withdrawal history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
