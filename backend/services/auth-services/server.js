const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./util/connectdb');
dotenv.config();

const {getAllUsers, getUserById, createUser, updateUser, deleteUser, changePassword, loginUser, logoutUser} = require('./src/user.controller');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
connectDB();
app.get('/users', getAllUsers);
app.get('/users/:id', getUserById);
app.post('/users', createUser);
app.put('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);
app.post('/users/login', loginUser);
app.post('/users/logout', logoutUser);
app.post('/users/change-password', changePassword);

app.listen(PORT, () => {
    console.log(`Auth service is running on port ${PORT}`);
});