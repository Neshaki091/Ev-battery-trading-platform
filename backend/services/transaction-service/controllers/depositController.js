const DepositRequest = require('../models/schemas/DepositRequest');
const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://backend-auth-service-1:3000';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'your-secret-internal-key';

/**
 * User: Tạo yêu cầu nạp tiền vào ví
 * POST /deposits/request
 */
exports.createDepositRequest = async (req, res) => {
    try {
        const { amount, bankTransferInfo } = req.body;
        const userId = req.user._id;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền nạp phải lớn hơn 0'
            });
        }

        // Validate bank transfer info
        if (!bankTransferInfo || !bankTransferInfo.transactionRef) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp thông tin chuyển khoản'
            });
        }

        const depositRequest = await DepositRequest.create({
            userId,
            amount,
            bankTransferInfo,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Yêu cầu nạp tiền đã được gửi. Vui lòng đợi admin xác nhận.',
            data: depositRequest
        });
    } catch (error) {
        console.error('[createDepositRequest] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể tạo yêu cầu nạp tiền',
            error: error.message
        });
    }
};

/**
 * User: Lấy danh sách yêu cầu nạp tiền của mình
 * GET /deposits/my-requests
 */
exports.getMyDepositRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        const filter = { userId };
        if (status) filter.status = status;

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(parseInt(limit, 10) || 10, 50);
        const skip = (pageNumber - 1) * limitNumber;

        const [requests, total] = await Promise.all([
            DepositRequest.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),
            DepositRequest.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: requests,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(total / limitNumber),
                totalItems: total,
                limit: limitNumber
            }
        });
    } catch (error) {
        console.error('[getMyDepositRequests] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách yêu cầu nạp tiền',
            error: error.message
        });
    }
};

/**
 * Admin: Lấy danh sách yêu cầu nạp tiền chờ duyệt
 * GET /admin/deposits/pending
 */
exports.getPendingDeposits = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(parseInt(limit, 10) || 20, 50);
        const skip = (pageNumber - 1) * limitNumber;

        const [requests, total] = await Promise.all([
            DepositRequest.find({ status: 'pending' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            DepositRequest.countDocuments({ status: 'pending' })
        ]);

        // Fetch user info for each request
        const requestsWithUser = await Promise.all(
            requests.map(async (req) => {
                try {
                    const userResponse = await axios.get(
                        `${AUTH_SERVICE_URL}/userprofile/${req.userId}`
                    );
                    return {
                        ...req,
                        user: {
                            _id: userResponse.data.user_id,
                            username: userResponse.data.username,
                            email: userResponse.data.email
                        }
                    };
                } catch (error) {
                    console.error(`Error fetching user ${req.userId}:`, error.message);
                    return { ...req, user: null };
                }
            })
        );

        res.json({
            success: true,
            data: requestsWithUser,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(total / limitNumber),
                totalItems: total,
                limit: limitNumber
            }
        });
    } catch (error) {
        console.error('[getPendingDeposits] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách yêu cầu nạp tiền',
            error: error.message
        });
    }
};

/**
 * Admin: Duyệt yêu cầu nạp tiền
 * POST /admin/deposits/:id/approve
 */
exports.approveDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;

        const depositRequest = await DepositRequest.findById(id);
        if (!depositRequest) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu nạp tiền'
            });
        }

        if (depositRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Yêu cầu đã được xử lý (${depositRequest.status})`
            });
        }

        // Cộng tiền vào ví user
        try {
            await axios.post(
                `${AUTH_SERVICE_URL}/wallet/add`,
                {
                    userId: depositRequest.userId.toString(),
                    amount: depositRequest.amount
                },
                {
                    headers: {
                        'x-internal-key': INTERNAL_API_KEY
                    }
                }
            );
        } catch (walletError) {
            console.error('[approveDeposit] Wallet error:', walletError.response?.data || walletError.message);
            return res.status(500).json({
                success: false,
                message: 'Không thể cộng tiền vào ví',
                error: walletError.response?.data?.error || walletError.message
            });
        }

        // Cập nhật trạng thái deposit request
        depositRequest.status = 'approved';
        depositRequest.processedBy = req.user._id;
        depositRequest.processedAt = new Date();
        depositRequest.adminNote = adminNote;
        await depositRequest.save();

        res.json({
            success: true,
            message: `Đã duyệt nạp ${depositRequest.amount.toLocaleString('vi-VN')} đ vào ví`,
            data: depositRequest
        });
    } catch (error) {
        console.error('[approveDeposit] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể duyệt yêu cầu nạp tiền',
            error: error.message
        });
    }
};

/**
 * Admin: Từ chối yêu cầu nạp tiền
 * POST /admin/deposits/:id/reject
 */
exports.rejectDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;

        if (!adminNote) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập lý do từ chối'
            });
        }

        const depositRequest = await DepositRequest.findById(id);
        if (!depositRequest) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy yêu cầu nạp tiền'
            });
        }

        if (depositRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Yêu cầu đã được xử lý (${depositRequest.status})`
            });
        }

        depositRequest.status = 'rejected';
        depositRequest.processedBy = req.user._id;
        depositRequest.processedAt = new Date();
        depositRequest.adminNote = adminNote;
        await depositRequest.save();

        res.json({
            success: true,
            message: 'Đã từ chối yêu cầu nạp tiền',
            data: depositRequest
        });
    } catch (error) {
        console.error('[rejectDeposit] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể từ chối yêu cầu nạp tiền',
            error: error.message
        });
    }
};

/**
 * Admin: Lấy lịch sử nạp tiền
 * GET /admin/deposits/history
 */
exports.getDepositHistory = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const filter = { status: { $in: ['approved', 'rejected'] } };
        if (status) filter.status = status;

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(parseInt(limit, 10) || 20, 50);
        const skip = (pageNumber - 1) * limitNumber;

        const [requests, total] = await Promise.all([
            DepositRequest.find(filter)
                .sort({ processedAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            DepositRequest.countDocuments(filter)
        ]);

        // Fetch user info
        const requestsWithUser = await Promise.all(
            requests.map(async (req) => {
                try {
                    const userResponse = await axios.get(
                        `${AUTH_SERVICE_URL}/userprofile/${req.userId}`
                    );
                    return {
                        ...req,
                        user: {
                            _id: userResponse.data.user_id,
                            username: userResponse.data.username,
                            email: userResponse.data.email
                        }
                    };
                } catch (error) {
                    return { ...req, user: null };
                }
            })
        );

        res.json({
            success: true,
            data: requestsWithUser,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(total / limitNumber),
                totalItems: total,
                limit: limitNumber
            }
        });
    } catch (error) {
        console.error('[getDepositHistory] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy lịch sử nạp tiền',
            error: error.message
        });
    }
};
