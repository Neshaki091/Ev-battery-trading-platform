const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    profile: {
        username: { type: String, default: '' },
        email: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        phonenumber: { type: String, required: true, unique: true },
    },
    password: { type: String },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['user', 'admin', 'guest'], default: 'user' },
    Tokens: [tokenSchema],
    macthedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

});

module.exports = mongoose.model('User', userSchema);