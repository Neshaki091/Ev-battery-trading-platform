const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date } // tuỳ chọn
});
module.exports = tokenSchema;