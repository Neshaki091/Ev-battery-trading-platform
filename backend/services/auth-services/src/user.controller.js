const { generateRefreshToken, generateAccessToken } = require('../util/refreshToken');
const userschema = require('../models/user.model');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userschema.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
};

exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await userschema.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
};
exports.createUser = async (req, res) => {
    const { email, password, phonenumber } = req.body;
    try {
        if (!email || !password || !phonenumber) {
            return res.status(400).json({ message: 'Email, password, and phone number are required' });
        }
        const userExists = await userschema.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new userschema({ email });
        console.log('Creating user with data:', newUser);
        newUser.password = passwordHash;
        newUser.phonenumber = phonenumber;
        console.log('Hashed password:', passwordHash);
        await newUser.save();
        console.log('User created successfully:', newUser);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const { username, email, password, phonenumber } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const updatedUser = await userschema.findByIdAndUpdate(
            userId,
            { username, email, hashedPassword, phonenumber },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
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
    console.log(email, password);
    try {
        await OwnerSchema.findOne({
            "profile.email": email
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const refreshToken = generateRefreshToken(user._id);
        const accessToken = generateAccessToken(user._id);
        console.log(refreshToken);
        console.log(accessToken);
        await addRefreshToken(user._id, refreshToken);
        console.log('User logged in:', user);

        res.status(200).json({ message: 'Login successful', user, });
    } catch (error) {
        res.status(500).json({ message: 'Error during login', error });
    }
};

exports.logoutUser = async (req, res) => {
    // In a real application, you would handle token invalidation or session destruction here.
    const userId = req.body;
    const refreshToken = await userschema.findById(userId).refreshTokens.token;
    await deleteRefreshToken(userId, refreshToken);
    res.status(200).json({ message: 'Logout successful' });
}

exports.changePassword = async (req, res) => {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await userschema.findById(userId);
        if (!user || user.password !== oldPassword) {
            return res.status(401).json({ message: 'Invalid old password' });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error changing password', error });
    }
};

const addRefreshToken = async (userId, newToken) => {
    console.log('Adding refresh token for user:', userId);
    await userschema.findByIdAndUpdate(
        userId,
        { $push: { refreshTokens: { token: newToken } } },
        { new: true } // trả về user mới sau khi update
    );
    console.log('Refresh token added:', newToken);
};
const deleteRefreshToken = async (userId, newToken) => {
    await userschema.findByIdAndUpdate(
        userId,
        { $pull: { refreshTokens: { token: newToken } } },
        { new: true } // trả về user mới sau khi update
    );
};
