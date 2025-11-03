const jwt = require('jsonwebtoken');
const userschema = require('../models/user.model')

const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

const getUserRefreshToken = async (userId, refreshToken) => {
    const userschema = require('../models/user.model');
    const user = await userschema.findById(userId);
    if (!user) return null;
    const tokenEntry = user.refreshTokens.find(tokenObj => tokenObj.refreshToken === refreshToken);
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
    await userschema.findByIdAndUpdate(
        userId,
        { $pull: {Tokens: { accessToken: accessToken } } },
        { new: true } // trả về user mới sau khi update
    );
}



module.exports = { generateRefreshToken, generateAccessToken, addUserRefreshToken, deleteUserRefreshToken, getUserRefreshToken };
