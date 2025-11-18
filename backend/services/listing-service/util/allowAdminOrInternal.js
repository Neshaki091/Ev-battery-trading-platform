// middleware/allowAdminOrInternal.js
const jwt = require('jsonwebtoken'); // Hoặc bất cứ cách nào bạn dùng để giải mã token
const { allowAdminRole } = require('../shared/adminMiddleware');
const { authmiddleware } = require('../shared/authmiddleware');

const allowAdminOrInternal = (req, res, next) => {
    try {
        // --- Điều kiện 1: Kiểm tra Service Nội Bộ ---
        const internalKey = req.headers['x-internal-key'];
        if (internalKey && internalKey === process.env.INTERNAL_API_KEY) {
            // Đây là service nội bộ đáng tin cậy (như TransactionService)
            return next();
        }
        authmiddleware(req, res, () => {
            // --- Điều kiện 2: Kiểm tra Vai Trò Admin ---
            allowAdminRole(req, res, next);
        });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid internal key.' });
    }
};

module.exports = { allowAdminOrInternal };