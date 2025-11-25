const Transaction = require('../models/schemas/Transaction');

/**
 * Get transactions for current user (role-based filtering)
 * GET /transactions/my-transactions
 */
exports.getMyTransactions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { role, status, page = 1, limit = 10 } = req.query;

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(parseInt(limit, 10) || 10, 50);
        const skip = (pageNumber - 1) * limitNumber;

        let filter = {};

        // Filter by role
        if (role === 'seller') {
            filter.sellerId = userId;
        } else if (role === 'buyer') {
            filter.userId = userId;
        } else {
            // Get both (user is either seller or buyer)
            filter.$or = [
                { sellerId: userId },
                { userId: userId }
            ];
        }

        // Filter by status
        if (status) {
            filter.status = status;
        }

        const [transactions, total] = await Promise.all([
            Transaction.find(filter)
                .populate('listingId', 'title images')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),
            Transaction.countDocuments(filter)
        ]);

        // Transform transactions based on user role
        const transformedTransactions = transactions.map(transaction => {
            const userRole = transaction.getUserRole(userId);

            if (userRole === 'seller') {
                return transaction.toSellerView();
            } else if (userRole === 'buyer') {
                return transaction.toBuyerView();
            }
            return transaction.toObject();
        });

        res.json({
            success: true,
            data: transformedTransactions,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(total / limitNumber),
                totalItems: total,
                limit: limitNumber
            }
        });
    } catch (error) {
        console.error('[getMyTransactions] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách giao dịch',
            error: error.message
        });
    }
};

/**
 * Get seller's pending transactions
 * GET /transactions/seller/pending
 */
exports.getSellerPendingTransactions = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(parseInt(limit, 10) || 10, 50);
        const skip = (pageNumber - 1) * limitNumber;

        const [transactions, total] = await Promise.all([
            Transaction.find({
                sellerId,
                status: 'pending'
            })
                .populate('listingId', 'title images price')
                .populate('userId', 'profile.username profile.email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),
            Transaction.countDocuments({
                sellerId,
                status: 'pending'
            })
        ]);

        const transformedTransactions = transactions.map(t => ({
            ...t.toSellerView(),
            listing: t.listingId,
            buyer: t.userId
        }));

        res.json({
            success: true,
            data: transformedTransactions,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(total / limitNumber),
                totalItems: total,
                limit: limitNumber
            }
        });
    } catch (error) {
        console.error('[getSellerPendingTransactions] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách giao dịch chờ xử lý',
            error: error.message
        });
    }
};

/**
 * Cancel transaction (seller only, pending status only)
 * POST /transactions/:id/cancel
 */
exports.cancelTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { reason } = req.body;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        // Check if user can cancel
        if (!transaction.canCancel(userId)) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền hủy giao dịch này',
                details: transaction.isSeller(userId)
                    ? 'Chỉ có thể hủy giao dịch đang ở trạng thái pending'
                    : 'Người mua không thể hủy giao dịch'
            });
        }

        // Update transaction status
        transaction.status = 'cancelled';
        transaction.sellerPayment.notes = reason || 'Seller cancelled transaction';
        await transaction.save();

        // TODO: Notify buyer about cancellation
        // TODO: Re-activate listing if needed

        res.json({
            success: true,
            message: 'Đã hủy giao dịch thành công',
            data: transaction.toSellerView()
        });
    } catch (error) {
        console.error('[cancelTransaction] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể hủy giao dịch',
            error: error.message
        });
    }
};

/**
 * Get transaction details with role-based view
 * GET /transactions/:id
 */
exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const transaction = await Transaction.findById(id)
            .populate('listingId', 'title images price description')
            .populate('userId', 'profile.username profile.email profile.phonenumber')
            .populate('sellerId', 'profile.username profile.email profile.phonenumber wallet');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        // Check if user is part of this transaction
        const userRole = transaction.getUserRole(userId);
        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem giao dịch này'
            });
        }

        // Return role-based view
        let transactionData;
        if (userRole === 'seller') {
            transactionData = {
                ...transaction.toSellerView(),
                listing: transaction.listingId,
                buyer: transaction.userId
            };
        } else {
            transactionData = {
                ...transaction.toBuyerView(),
                listing: transaction.listingId,
                seller: transaction.sellerId
            };
        }

        res.json({
            success: true,
            data: transactionData
        });
    } catch (error) {
        console.error('[getTransactionById] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thông tin giao dịch',
            error: error.message
        });
    }
};

/**
 * Check if user can message in transaction
 * GET /transactions/:id/can-message
 */
exports.canMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        const canMessage = transaction.canMessage(userId);
        const userRole = transaction.getUserRole(userId);

        res.json({
            success: true,
            canMessage,
            userRole,
            transactionId: transaction._id,
            otherPartyId: userRole === 'seller' ? transaction.userId : transaction.sellerId
        });
    } catch (error) {
        console.error('[canMessage] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể kiểm tra quyền nhắn tin',
            error: error.message
        });
    }
};

/**
 * Sign contract for a transaction (buyer or seller)
 * POST /transactions/:id/sign
 */
exports.signContract = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { deviceInfo } = req.body || {};

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        const userRole = transaction.getUserRole(userId);
        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền ký giao dịch này'
            });
        }

        if (!['paid', 'completed'].includes(transaction.status)) {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể ký hợp đồng sau khi đơn hàng đã được thanh toán'
            });
        }

        const now = new Date();

        if (userRole === 'buyer') {
            if (transaction.buyerSignature && transaction.buyerSignature.signedAt) {
                return res.json({
                    success: true,
                    alreadySigned: true,
                    data: transaction.toBuyerView()
                });
            }
            transaction.buyerSignature = {
                signedAt: now,
                deviceInfo: deviceInfo || ''
            };
        } else if (userRole === 'seller') {
            if (transaction.sellerSignature && transaction.sellerSignature.signedAt) {
                return res.json({
                    success: true,
                    alreadySigned: true,
                    data: transaction.toSellerView()
                });
            }
            transaction.sellerSignature = {
                signedAt: now,
                deviceInfo: deviceInfo || ''
            };
        }

        await transaction.save();

        const view =
            userRole === 'seller'
                ? transaction.toSellerView()
                : transaction.toBuyerView();

        res.json({
            success: true,
            data: view
        });
    } catch (error) {
        console.error('[signContract] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể ký hợp đồng',
            error: error.message
        });
    }
};