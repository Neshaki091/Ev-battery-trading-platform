const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./util/connectdb');
dotenv.config();

const {getAllUsers, getAllUsersProfiles, getUserById,getMe, createUser, updateUser, deleteUser, changePassword, loginUser, logoutUser} = require('./src/user.controller');
const { authmiddleware } = require('./util/middleware');
const {allowAdminRole, deleteUserRole} = require("./util/rule")
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
connectDB();
app.get('/users',authmiddleware,allowAdminRole, getAllUsers);
app.get('/usersprofile', getAllUsersProfiles )
app.get('/userprofile/:id', getUserById);
app.post('/users', createUser);
app.put('/users/:id',authmiddleware, updateUser);
app.delete('/users/:id',authmiddleware, deleteUser);
app.post('/users/login', loginUser);
app.post('/users/logout',authmiddleware,deleteUser, logoutUser);
app.post('/users/:id/change-password',authmiddleware, changePassword);

app.listen(PORT, () => {
    console.log(`Auth service is running on port ${PORT}`);
});