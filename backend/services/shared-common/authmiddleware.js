// Shared Authentication Middleware
// Used across all microservices
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Authentication middleware to verify JWT tokens
 * Extracts user information from token and attaches to req.user
 */
exports.authmiddleware = async (req, res, next) => {
    try {
        // Check if authorization header exists
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        // Extract token from "Bearer <token>"
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing after "Bearer"' });
        }

        // Verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to request object
        req.user = {
            _id: decoded.id, // Use _id for consistency with MongoDB
            role: decoded.role,
            isActive: decoded.isActive
        };

        // Check if user account is active
        if (req.user.isActive === false) {
            return res.status(403).json({ message: 'Forbidden: Account is locked or deactivated' });
        }

        next();
    } catch (error) {
        // Handle different error types
        console.error("Authentication Error:", error);
        const message = error.name === 'TokenExpiredError' 
            ? 'Token expired' 
            : error.name === 'JsonWebTokenError'
            ? 'Invalid token'
            : 'Unauthorized';
        res.status(401).json({ message: `Unauthorized: ${message}`, error: error.message });
    }
};

