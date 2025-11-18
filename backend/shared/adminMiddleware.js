// Shared Admin Middleware
// Used across all microservices that require admin privileges
// Must be used after authmiddleware

/**
 * Middleware to check if user has admin role
 * Requires req.user to be set by authmiddleware
 */
exports.allowAdminRole = (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            error: 'Authentication required. Please login first.' 
        });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            error: 'Access denied. Admin privileges required.' 
        });
    }

    next();
};

