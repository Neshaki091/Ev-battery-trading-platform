const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const userschema = require('../models/user.model');
dotenv.config();

exports.authmiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        const user = await userschema.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        
        // KIỂM TRA TRẠNG THÁI ACTIVE
        if (user.isActive === false) {
             return res.status(403).json({ message: 'Forbidden: Account is locked or deactivated' });
        }

        req.user = user;
        next();
    } catch (error) {
        const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
        res.status(401).json({ message: `Unauthorized: ${message}`, error: error.message });
    }
};