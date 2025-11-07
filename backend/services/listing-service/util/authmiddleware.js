// listing-service/util/authmiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
exports.authmiddleware = async (req, res, next) => {
    try {
        // KIỂM TRA HEADER TRƯỚC KHI SỬ DỤNG
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        // Split chỉ khi header đã tồn tại
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing after "Bearer"' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Đảm bảo bạn đang gán _id
        req.user = {
            _id: decoded.id, // Sử dụng _id để nhất quán với MongoDB
            role: decoded.role
        };

        next();
    } catch (error) {
        // Ghi lại lỗi để debug (ví dụ: lỗi Invalid Signature)
        console.error("Authentication Error:", error);
        res.status(401).json({ message: 'Unauthorized or Invalid Token' });
    }
};