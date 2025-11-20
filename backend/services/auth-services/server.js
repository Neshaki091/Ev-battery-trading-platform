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
    logoutUser
} = require('./src/user.controller');

const { authmiddleware } = require('./shared/authmiddleware');
const { allowAdminRole, deleteUserRole } = require('./util/rule');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/users', authmiddleware, allowAdminRole, getAllUsers);
app.get('/me', authmiddleware, getMe);
app.get('/usersprofile', authmiddleware, getAllUsersProfiles);
app.get('/userprofile/:id', authmiddleware, getUserById);
app.get('/seller/:id', getSellerById); // công khai
app.post('/users', createUser);
app.put('/users/:id', authmiddleware, updateUser);
app.delete('/users/:id', authmiddleware, deleteUserRole);
app.post('/users/login', loginUser);
app.post('/users/logout', authmiddleware, logoutUser);
app.post('/users/:id/change-password', authmiddleware, changePassword);

// Server
app.listen(PORT, () => {
    console.log(`✅ Auth service is running on port ${PORT}`);
});
