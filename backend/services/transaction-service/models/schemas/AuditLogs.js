const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entityType: { type: String, enum: ['User', 'Listing', 'Transaction'], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ipAddress: String,
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AuditLogs', logsSchema);