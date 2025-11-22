// listing-service/util/authmiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

exports.authmiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // SỬA LẠI: Gán cả id và role vào req.user
        req.user = {
            _id: decoded.id,
            role: decoded.role // Thêm dòng này
        };

        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error });
    }
};