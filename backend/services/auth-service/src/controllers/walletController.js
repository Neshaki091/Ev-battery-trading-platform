// src/controllers/walletController.js
const User = require('../../models/user.model');

/**
 * Cộng tiền vào ví user (internal use only)
 * POST /wallet/add
 */
exports.addToWallet = async (req, res) => {
    try {
        const { userId, amount } = req.body;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'userId và amount (> 0) là bắt buộc'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        // Cộng tiền vào ví
        user.walletBalance = (user.walletBalance || 0) + amount;
        await user.save();

        console.log(`[Wallet] Added ${amount} to user ${userId}. New balance: ${user.walletBalance}`);

        res.status(200).json({
            success: true,
            message: `Đã cộng ${amount.toLocaleString('vi-VN')} đ vào ví`,
            walletBalance: user.walletBalance
        });
    } catch (error) {
        console.error('Error adding to wallet:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Trừ tiền khỏi ví user (internal use only)
 * POST /wallet/deduct
 */
exports.deductFromWallet = async (req, res) => {
    try {
        const { userId, amount } = req.body;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'userId và amount (> 0) là bắt buộc'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        const currentBalance = user.walletBalance || 0;

        if (currentBalance < amount) {
            return res.status(400).json({
                success: false,
                error: `Số dư không đủ. Hiện tại: ${currentBalance.toLocaleString('vi-VN')} đ`
            });
        }

        // Trừ tiền khỏi ví
        user.walletBalance = currentBalance - amount;
        await user.save();

        console.log(`[Wallet] Deducted ${amount} from user ${userId}. New balance: ${user.walletBalance}`);

        res.status(200).json({
            success: true,
            message: `Đã trừ ${amount.toLocaleString('vi-VN')} đ khỏi ví`,
            walletBalance: user.walletBalance
        });
    } catch (error) {
        console.error('Error deducting from wallet:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Lấy số dư ví (for user)
 * GET /wallet/balance
 */
exports.getWalletBalance = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        res.status(200).json({
            success: true,
            walletBalance: user.walletBalance || 0
        });
    } catch (error) {
        console.error('Error getting wallet balance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Khóa tiền trong ví (for auction deposits)
 * POST /wallet/reserve
 */
exports.reserveBalance = async (req, res) => {
    try {
        const { userId, amount, auctionId } = req.body;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'userId và amount (> 0) là bắt buộc'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        const walletBalance = user.walletBalance || 0;
        const reservedBalance = user.reservedBalance || 0;
        const availableBalance = walletBalance - reservedBalance;

        if (availableBalance < amount) {
            return res.status(400).json({
                success: false,
                error: `Số dư khả dụng không đủ. Hiện tại: ${availableBalance.toLocaleString('vi-VN')} đ`,
                availableBalance,
                walletBalance,
                reservedBalance
            });
        }

        // Khóa tiền
        user.reservedBalance = reservedBalance + amount;
        await user.save();

        console.log(`[Wallet] Reserved ${amount} for user ${userId} (auction: ${auctionId}). Reserved: ${user.reservedBalance}`);

        res.status(200).json({
            success: true,
            message: `Đã khóa ${amount.toLocaleString('vi-VN')} đ`,
            walletBalance: user.walletBalance,
            reservedBalance: user.reservedBalance,
            availableBalance: user.walletBalance - user.reservedBalance
        });
    } catch (error) {
        console.error('Error reserving balance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Hoàn lại tiền đã khóa (when outbid or auction cancelled)
 * POST /wallet/release
 */
exports.releaseBalance = async (req, res) => {
    try {
        const { userId, amount, auctionId } = req.body;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'userId và amount (> 0) là bắt buộc'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        const reservedBalance = user.reservedBalance || 0;

        if (reservedBalance < amount) {
            console.warn(`[Wallet] Trying to release ${amount} but only ${reservedBalance} is reserved for user ${userId}`);
            // Vẫn cho phép release, nhưng chỉ release số tiền đang bị khóa
            user.reservedBalance = Math.max(0, reservedBalance - amount);
        } else {
            user.reservedBalance = reservedBalance - amount;
        }

        await user.save();

        console.log(`[Wallet] Released ${amount} for user ${userId} (auction: ${auctionId}). Reserved: ${user.reservedBalance}`);

        res.status(200).json({
            success: true,
            message: `Đã hoàn lại ${amount.toLocaleString('vi-VN')} đ`,
            walletBalance: user.walletBalance,
            reservedBalance: user.reservedBalance,
            availableBalance: user.walletBalance - user.reservedBalance
        });
    } catch (error) {
        console.error('Error releasing balance:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
