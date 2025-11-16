const jwt = require('jsonwebtoken');
const userschema = require('../models/user.model')

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, isActive: user.isActive }, // Thêm "role: user.role"
        process.env.JWT_SECRET, // NÊN DÙNG JWT_REFRESH_SECRET khác
        { expiresIn: '7d' }
    );
}

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, isActive: user.isActive }, // Thêm "role: user.role"
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
}

const getUserRefreshToken = async (userId, refreshToken) => {
    const userschema = require('../models/user.model');
    const user = await userschema.findById(userId);
    if (!user) return null;
    const tokenEntry = user.Tokens.find(tokenObj => tokenObj.refreshToken === refreshToken);
    return tokenEntry || null;
}
const addUserRefreshToken = async (userId, refreshToken, accessToken) => {
    console.log('Adding refresh token for user:', userId);
    await userschema.findByIdAndUpdate(
        userId,
        { $push: { Tokens: { refreshToken: refreshToken, accessToken: accessToken } } },
        { new: true } // trả về user mới sau khi update
    );
}
const deleteUserRefreshToken = async (userId, accessToken) => {
    const token = accessToken.split(' ')[1];
    await userschema.findByIdAndUpdate(
        userId,
        { $pull: { Tokens: { accessToken: token } } },
        { new: true } // trả về user mới sau khi update
    );
}



module.exports = { generateRefreshToken, generateAccessToken, addUserRefreshToken, deleteUserRefreshToken, getUserRefreshToken };
