// models/schemas/FeeConfig.js
const mongoose = require('mongoose');

const feeConfigSchema = new mongoose.Schema({
    // Loại phí (ví dụ: 'DEFAULT', 'PROMOTION', 'VEHICLE', 'BATTERY')
    type: { type: String, required: true, unique: true, uppercase: true },
    
    // Tỷ lệ hoa hồng (ví dụ: 0.05 tương đương 5%)
    rate: { type: Number, required: true, min: 0, max: 1 }, 
    
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: false }, 
    
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('FeeConfig', feeConfigSchema);

