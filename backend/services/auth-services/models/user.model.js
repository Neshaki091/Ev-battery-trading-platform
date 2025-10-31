const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, default: '' },
    password: { type: String},
    email: { type: String, required: true, unique: true },
    phonenumber: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['user', 'admin', 'guest'], default: 'user' },
    refreshTokens: [{ token: { type: String, required: true } }],
    macthedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
});

module.exports = mongoose.model('User', userSchema);