// controllers/adminFeeController.js
const FeeConfig = require('../models/schemas/FeeConfig');

// Lấy tất cả cấu hình phí
exports.getAllFeeConfigs = async (req, res) => {
    try {
        const configs = await FeeConfig.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: configs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Tạo cấu hình phí mới
exports.createFeeConfig = async (req, res) => {
    try {
        const newConfig = await FeeConfig.create(req.body);
        res.status(201).json({ success: true, data: newConfig });
    } catch (error) {
        if (error.code === 11000) {
             return res.status(400).json({ success: false, error: 'Fee config type already exists.' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// Cập nhật cấu hình phí
exports.updateFeeConfig = async (req, res) => {
    try {
        const updatedConfig = await FeeConfig.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedConfig) {
            return res.status(404).json({ success: false, error: 'Fee config not found' });
        }
        res.status(200).json({ success: true, data: updatedConfig });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Xóa cấu hình phí
exports.deleteFeeConfig = async (req, res) => {
     try {
        const deletedConfig = await FeeConfig.findByIdAndDelete(req.params.id);
        if (!deletedConfig) {
            return res.status(404).json({ success: false, error: 'Fee config not found' });
        }
        res.status(200).json({ success: true, message: 'Fee config deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}