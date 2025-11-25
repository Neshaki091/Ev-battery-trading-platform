const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./util/connectdb');
const {
    getAllUsers,
    getAllUsersProfiles,
    getMe,
    getUserById,
    getSellerById,
    createUser,
    updateUser,
    changePassword,
    loginUser,
    logoutUser,
    checkWalletInfo
} = require('./src/user.controller');

const walletController = require('./src/controllers/walletController');
const { authmiddleware } = require('./shared/authmiddleware');
const { allowAdminRole, deleteUserRole } = require('./util/rule');

// Middleware for internal API key
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

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// User Routes
app.get('/users', authmiddleware, allowAdminRole, getAllUsers);
app.get('/me', authmiddleware, getMe);
app.get('/usersprofile', authmiddleware, getAllUsersProfiles);
app.get('/userprofile/:id', authmiddleware, getUserById);
app.get('/seller/:id', getSellerById); // Public
app.post('/users/check-wallet', authmiddleware, checkWalletInfo);
app.post('/users', createUser);
app.put('/users/:id', authmiddleware, updateUser);
app.delete('/users/:id', authmiddleware, deleteUserRole);
app.post('/users/login', loginUser);
app.post('/users/logout', authmiddleware, logoutUser);
app.post('/users/:id/change-password', authmiddleware, changePassword);

// 🆕 Wallet Routes (Internal - require internal API key)
app.post('/wallet/add', requireInternalKey, walletController.addToWallet);
app.post('/wallet/deduct', requireInternalKey, walletController.deductFromWallet);
app.post('/wallet/reserve', requireInternalKey, walletController.reserveBalance);
app.post('/wallet/release', requireInternalKey, walletController.releaseBalance);

// 🆕 Wallet Routes (User)
app.get('/wallet/balance', authmiddleware, walletController.getWalletBalance);

// Server
app.listen(PORT, () => {
    console.log(`✅ Auth service is running on port ${PORT}`);
    console.log('\n📋 Available Endpoints:');
    console.log('\n👤 Users:');
    console.log('  - GET    /users');
    console.log('  - GET    /me');
    console.log('  - GET    /usersprofile');
    console.log('  - GET    /userprofile/:id');
    console.log('  - GET    /seller/:id');
    console.log('  - POST   /users');
    console.log('  - PUT    /users/:id');
    console.log('  - DELETE /users/:id');
    console.log('  - POST   /users/login');
    console.log('  - POST   /users/logout');
    console.log('  - POST   /users/:id/change-password');
    console.log('  - POST   /users/check-wallet');

    console.log('\n💰 Wallet (Internal):');
    console.log('  - POST   /wallet/add (requires internal key)');
    console.log('  - POST   /wallet/deduct (requires internal key)');
    console.log('  - POST   /wallet/reserve (requires internal key)');
    console.log('  - POST   /wallet/release (requires internal key)');

    console.log('\n💳 Wallet (User):');
    console.log('  - GET    /wallet/balance');

    console.log('\n✅ Service ready!\n');
});
