const jwt = require('jsonwebtoken');
const OwnerSchema = require('../models/owner.model');
const userschema = require('../models/user.model')

const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

const getOwnerRefreshToken = async (userId, refreshToken) => {
    const OwnerSchema = require('../models/owner.model');
    const owner = await OwnerSchema.findById(userId);
    if (!owner) return null;
    const tokenEntry = owner.Tokens.find(tokenObj => tokenObj.refreshToken === refreshToken);
    return tokenEntry || null;
};
const addUserRefreshToken = async (userId, refreshToken, accessToken) => {
    console.log('Adding refresh token for user:', userId);
    await userschema.findByIdAndUpdate(
        userId,
        { $push: { refreshTokens: { refreshToken: refreshToken, accessToken: accessToken } } },
        { new: true } // trả về user mới sau khi update
    );
}
const deleteUserRefreshToken = async (userId, accessToken) => {
    await userschema.findByIdAndUpdate(
        userId,
        { $pull: { refreshTokens: { accessToken: accessToken } } },
        { new: true } // trả về user mới sau khi update
    );
}



module.exports = { generateRefreshToken, generateAccessToken, addOwnerRefreshToken, deleteOwnerRefreshToken, addUserRefreshToken, deleteUserRefreshToken, getOwnerRefreshToken, getUserRefreshToken };
