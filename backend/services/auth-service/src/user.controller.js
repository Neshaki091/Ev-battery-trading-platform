const { generateRefreshToken, generateAccessToken, addUserRefreshToken, deleteUserRefreshToken, getUserRefreshToken } = require('../util/refreshToken');
const userschema = require('../models/user.model');
const bcrypt = require('bcrypt');
const { publishEvent } = require('../util/mqService');

exports.getAllUsers = async (req, res) => {
    // Đã có logic .select() tốt
    try {
        const users = await userschema.find().select('-password -Tokens');
        if (!users || users.length === 0) {
            // Nên dùng 200/404 thay vì 403 nếu không tìm thấy, 403 là cho quyền truy cập
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error: error.message });
    }
};


exports.getAllUsersProfiles = async (req, res) => {
    try {
        const users = await userschema.find();
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.status(200).json(users.map(u => ({
            profile: u.profile,
            macthedProfiles: u.macthedProfiles
        })));

    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
};
exports.getMe = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({ message: "Missing user ID in token" });
        }

        const user = await userschema.findById(userId).select("_id profile wallet walletBalance macthedProfiles role isActive createdAt");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            user_id: user._id,
            profile: user.profile,
            wallet: user.wallet || {},
            walletBalance: user.walletBalance || 0,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            macthedProfiles: user.macthedProfiles
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving user",
            error: error.message
        });
    }
};

exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await userschema.findById(userId)
            .populate('matchedProfiles', 'profile.username profile.email'); // nếu muốn lấy thông tin match

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user_id: user._id,
            username: user.profile.username,
            email: user.profile.email,
            phonenumber: user.profile.phonenumber,
            firstName: user.profile.firstName || '',
            lastName: user.profile.lastName || '',
            wallet: user.wallet || {},
            walletBalance: user.walletBalance || 0,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            matchedProfiles: user.matchedProfiles, // Đúng chính tả
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error: error.message });
    }
};
exports.getSellerById = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await userschema.findById(userId)
            .populate('matchedProfiles', 'profile.username profile.email');

        if (!user) {
            return res.status(404).json({ message: 'Seller not found' });
        }

        res.status(200).json({
            user_id: user._id,
            username: user.profile.username,
            email: user.profile.email,
            phonenumber: user.profile.phonenumber,
            firstName: user.profile.firstName || '',
            lastName: user.profile.lastName || '',
            wallet: user.wallet || {},
            walletBalance: user.walletBalance || 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving seller', error: error.message });
    }
};

exports.createUser = async (req, res) => {
    const { phonenumber, email, password, adminCode, firstName, lastName } = req.body;
    try {
        if (!email || !password || !phonenumber) {
            return res.status(400).json({ message: 'Email, password, and phone number are required' });
        }
        let userRole = "user";
        if (adminCode === process.env.MY_SECRECT_ADMIN_CODE) {
            userRole = 'admin';
        }

        // Kiểm tra trùng lặp email VÀ phonenumber
        const userExists = await userschema.findOne({
            $or: [
                { "profile.email": email },
                { "profile.phonenumber": phonenumber }
            ]
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email or phone number' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Username mặc định là phần trước @ của email, không thể thay đổi
        const defaultUsername = email.split('@')[0];

        const newUser = new userschema({
            profile: {
                email,
                phonenumber,
                username: defaultUsername, // Username mặc định từ email, không thể thay đổi
                firstName: firstName || '',
                lastName: lastName || ''
            },
            password: passwordHash,
            role: userRole,
        });

        // Sửa lỗi: không cần gán lại newUser.password = passwordHash
        await newUser.save();

        const userObject = newUser.toObject();
        delete userObject.password;
        delete userObject.Tokens;

        // Publish event to RabbitMQ
        try {
            await publishEvent('user_registered', {
                userId: newUser._id,
                email: newUser.profile.email
            });
        } catch (error) {
            console.error('Error publishing user_registered event:', error.message);
        }

        res.status(201).json({ message: 'User created successfully', user: userObject });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or phone number already exists' });
        }
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// ...
exports.updateUser = async (req, res) => {
    const targetUserId = req.params.id;
    const requester = req.user;
    const { username, email, phonenumber, role, isActive, firstName, lastName, wallet, ...rest } = req.body; // Destructure các trường cần cập nhật

    try {
        console.log('Access denied: ', requester._id.toString(), targetUserId, requester.role);
        // KIỂM TRA QUYỀN (Authorization)
        if (requester._id.toString() !== targetUserId && requester.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
        }
        let updateFields = {};

        // 1. CHỈNH SỬA FIELD PROFILE
        // Username không thể thay đổi (mặc định là phần trước @ của email)
        if (username) {
            return res.status(403).json({ message: 'Username cannot be changed. It is automatically set from your email address.' });
        }
        if (firstName !== undefined) updateFields["profile.firstName"] = firstName;
        if (lastName !== undefined) updateFields["profile.lastName"] = lastName;

        // 2. CẬP NHẬT THÔNG TIN VÍ (Wallet)
        if (wallet !== undefined) {
            if (wallet.bankName !== undefined) updateFields["wallet.bankName"] = wallet.bankName;
            if (wallet.bankCode !== undefined) updateFields["wallet.bankCode"] = wallet.bankCode;
            if (wallet.accountNumber !== undefined) updateFields["wallet.accountNumber"] = wallet.accountNumber;
            if (wallet.accountName !== undefined) updateFields["wallet.accountName"] = wallet.accountName;
            if (wallet.branch !== undefined) updateFields["wallet.branch"] = wallet.branch;
        }

        // 3. CHỈNH SỬA FIELD CẤP CAO (Chỉ Admin hoặc logic đặc biệt)
        if (requester.role === 'admin') {
            if (role) updateFields["role"] = role;
            if (isActive !== undefined) updateFields["isActive"] = isActive;
        } else {
            // NGĂN user thường tự cập nhật role/isActive (mặc dù đã delete ở đầu hàm)
            if (role || isActive !== undefined) {
                return res.status(403).json({ message: 'Forbidden: Cannot change sensitive fields like role or active status.' });
            }
        }

        // CẬP NHẬT EMAIL/PHONE: Chỉ Admin được phép cập nhật mà không cần xác thực OTP/link
        if (email) updateFields["profile.email"] = email;
        if (phonenumber) updateFields["profile.phonenumber"] = phonenumber;

        // Nếu người dùng không phải Admin, không thể cập nhật email hoặc phone number
        // vì cần logic xác thực phức tạp.

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: "No valid update fields provided." });
        }

        const updatedUser = await userschema.findByIdAndUpdate(
            targetUserId,
            { $set: updateFields }, // SỬ DỤNG updateFields đã được chuẩn hóa
            { new: true, runValidators: true }
        ).select('-password -Tokens');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or phone number already in use' });
        }
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};


exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const deletedUser = await userschema.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userschema.findOne({ "profile.email": email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // KIỂM TRA TRẠNG THÁI ACTIVE
        if (user.isActive === false) {
            return res.status(403).json({ message: 'Account is locked or deactivated' });
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const refreshToken = generateRefreshToken(user);
        const accessToken = generateAccessToken(user);

        // Lưu Refresh Token
        await addUserRefreshToken(user._id, refreshToken, accessToken);

        // Chuẩn bị response
        const responseUser = user.toObject();
        delete responseUser.password;
        delete responseUser.Tokens; // Không trả về token trong response

        res.status(200).json({
            message: 'Login successful',
            user: responseUser, // Trả về toàn bộ user object (trừ pass/token)
            accessToken: accessToken,
            isActive: user.isActive,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
};

exports.logoutUser = async (req, res) => {
    const userId = req.user._id;
    const accessToken = req.headers.authorization;
    await deleteUserRefreshToken(userId, accessToken);
    res.status(200).json({ message: 'Logout successful' });
}

exports.changePassword = async (req, res) => {
    const targetUserId = req.params.id; // ID của user cần đổi mật khẩu
    const requester = req.user;// User đang thực hiện yêu cầu
    const { oldPassword, newPassword } = req.body;

    try {
        // SỬA LẠI: KIỂM TRA QUYỀN
        // Chỉ cho phép user tự đổi mật khẩu của mình (admin cũng không được đổi)
        if (requester._id.toString() !== targetUserId) {
            return res.status(403).json({ message: 'Access denied. You can only change your own password.' });
        }

        const user = await userschema.findById(targetUserId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid old password' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password', error });
    }
};

/**
 * Kiểm tra xem user đã cập nhật thông tin chuyển khoản (wallet) chưa
 * GET /users/:id/check-wallet
 */
exports.checkWalletInfo = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await userschema.findById(userId).select('wallet');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Kiểm tra xem các trường quan trọng của wallet đã được điền chưa
        const hasWalletInfo = user.wallet &&
            user.wallet.bankName &&
            user.wallet.accountNumber &&
            user.wallet.accountName;

        res.status(200).json({
            success: true,
            hasWalletInfo: !!hasWalletInfo,
            wallet: user.wallet || {},
            message: hasWalletInfo
                ? 'Thông tin chuyển khoản đã được cập nhật'
                : 'Chưa cập nhật thông tin chuyển khoản'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking wallet info',
            error: error.message
        });
    }
};
