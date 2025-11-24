const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }

            req.user = user;
            next();
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
};

/**
 * Middleware to verify internal API key for service-to-service communication
 */
const requireInternalKey = (req, res, next) => {
    const internalKey = req.headers['x-internal-key'];
    const expectedKey = process.env.INTERNAL_API_KEY || 'your-secret-internal-key';

    if (internalKey === expectedKey) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Invalid internal API key'
        });
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireInternalKey
};
