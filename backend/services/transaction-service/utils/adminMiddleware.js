// reports-service/util/adminMiddleware.js (Cũng dùng cho Analytics Service)
exports.allowAdminRole = (req, res, next) => {
    // Giả định req.user được populate từ authmiddleware
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Access denied. Admin privileges required.' });
    }
    next(); 
};

