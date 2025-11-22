// controllers/adminPaymentController.js
const Transaction = require('../models/schemas/Transaction');
const axios = require('axios');

/**
 * Lấy danh sách giao dịch cần thanh toán cho seller
 * GET /admin/payments/pending
 */
exports.getPendingPayments = async (req, res) => {
    try {
        // Lấy các giao dịch đã paid nhưng chưa chuyển tiền cho seller
        const transactions = await Transaction.find({
            status: 'paid',
            'sellerPayment.status': { $in: ['pending', null] }
        })
        .sort({ paidAt: -1 })
        .limit(100);

        // Lấy thông tin seller cho mỗi transaction
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://backend-auth-service-1:3000';
        const enrichedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                try {
                    const sellerResponse = await axios.get(
                        `${authServiceUrl}/seller/${transaction.sellerId}`,
                        { headers: { 'x-internal-key': process.env.INTERNAL_API_KEY } }
                    );
                    
                    const sellerAmount = transaction.price - (transaction.commissionAmount || 0);
                    
                    return {
                        _id: transaction._id,
                        price: transaction.price,
                        commissionAmount: transaction.commissionAmount,
                        sellerAmount: sellerAmount,
                        paidAt: transaction.paidAt,
                        type: transaction.type,
                        seller: sellerResponse.data,
                        sellerPayment: transaction.sellerPayment || { status: 'pending' },
                        cassoPayment: transaction.cassoPayment
                    };
                } catch (error) {
                    console.error(`Error fetching seller ${transaction.sellerId}:`, error.message);
                    return {
                        _id: transaction._id,
                        price: transaction.price,
                        commissionAmount: transaction.commissionAmount,
                        sellerAmount: transaction.price - (transaction.commissionAmount || 0),
                        paidAt: transaction.paidAt,
                        type: transaction.type,
                        seller: { user_id: transaction.sellerId, username: 'Unknown' },
                        sellerPayment: transaction.sellerPayment || { status: 'pending' },
                        cassoPayment: transaction.cassoPayment
                    };
                }
            })
        );

        res.status(200).json({
            success: true,
            data: enrichedTransactions
        });
    } catch (error) {
        console.error('Error fetching pending payments:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
/**
 * Xác nhận đã chuyển tiền cho seller
 * POST /admin/payments/:transactionId/confirm
 */
exports.confirmPayment = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { transactionRef, notes } = req.body;
        const adminId = req.user._id;

        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy giao dịch'
            });
        }

        if (transaction.status !== 'paid') {
            return res.status(400).json({
                success: false,
                error: 'Giao dịch chưa được thanh toán bởi người mua'
            });
        }

        const sellerAmount = transaction.price - (transaction.commissionAmount || 0);

        transaction.sellerPayment = {
            status: 'completed',
            amount: sellerAmount,
            paidAt: new Date(),
            confirmedBy: adminId,
            transactionRef: transactionRef || '',
            notes: notes || ''
        };

        // Cập nhật status transaction sang completed
        transaction.status = 'completed';

        await transaction.save();

        res.status(200).json({
            success: true,
            message: 'Đã xác nhận thanh toán cho seller',
            data: transaction
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Lấy lịch sử thanh toán cho seller
 * GET /admin/payments/history
 */
exports.getPaymentHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            'sellerPayment.status': 'completed'
        })
        .sort({ 'sellerPayment.paidAt': -1 })
        .limit(100);

        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://backend-auth-service-1:3000';
        const enrichedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                try {
                    const sellerResponse = await axios.get(
                        `${authServiceUrl}/seller/${transaction.sellerId}`,
                        { headers: { 'x-internal-key': process.env.INTERNAL_API_KEY } }
                    );
                    
                    return {
                        _id: transaction._id,
                        price: transaction.price,
                        commissionAmount: transaction.commissionAmount,
                        paidAt: transaction.paidAt,
                        type: transaction.type,
                        seller: sellerResponse.data,
                        sellerPayment: transaction.sellerPayment
                    };
                } catch (error) {
                    return null;
                }
            })
        );
res.status(200).json({
            success: true,
            data: enrichedTransactions.filter(t => t !== null)
        });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};