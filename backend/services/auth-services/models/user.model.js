const mongoose = require('mongoose');
const tokenSchema = require('./token.model');
const userSchema = new mongoose.Schema({
    profile: {
        username: { type: String, default: '' },
        email: { type: String, required: true, unique: true},
        createdAt: { type: Date, default: Date.now },
        phonenumber: { type: String, required: true, unique: true },
        createdAt: { type: Date, default: Date.now },
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'guest'], default: 'user' },
    Tokens: [tokenSchema],
    macthedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

});

module.exports = mongoose.model('User', userSchema);