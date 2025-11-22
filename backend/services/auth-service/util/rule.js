const userschema = require('../models/user.model');

exports.allowAdminRole = async (req, res, next) => {
    try {
        const role = req.user.role;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        next(); 
    } catch (error) {
        res.status(500).json({ message: 'Authorization error', error });
    }
};

exports.deleteUserRole = async (req, res) => {
    const targetUserId = req.params.id;     // user cần xoá
    const requester = req.user;             // user đang đăng nhập

    try {
        // Nếu không phải chính chủ hoặc admin thì chặn
        if (requester._id.toString() !== targetUserId && requester.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Not allowed to delete this account.' });
        }

        const deletedUser = await userschema.findByIdAndDelete(targetUserId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

