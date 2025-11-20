// reports-service/src/controllers/report.controller.js
const Report = require('../models/Report.model');
const { publishEvent } = require('../../util/mqService');

// 1. Tạo báo cáo (User)
exports.createReport = async (req, res) => {
    try {
        const reporterId = req.user._id; // Lấy từ authmiddleware
        const { subjectType, subjectId, reasonCode, details } = req.body;

        if (!subjectType || !subjectId || !reasonCode) {
            return res.status(400).json({ message: 'Missing subjectType, subjectId, or reasonCode' });
        }

        const report = await Report.create({
            reporterId,
            subjectType,
            subjectId,
            reasonCode,
            details,
        });

        // Publish event to RabbitMQ for analytics service
        try {
            await publishEvent('report_created', {
                reportId: report._id,
                reporterId: report.reporterId,
                targetId: report.subjectId
            });
        } catch (error) {
            console.error('Error publishing report_created event:', error.message);
        }

        res.status(201).json({ success: true, message: 'Report submitted successfully', data: report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Lấy tất cả báo cáo (Admin)
exports.getAllReports = async (req, res) => {
    // ⚠️ Đã kiểm tra quyền Admin qua adminMiddleware
    try {
        const { status, subjectType } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (subjectType) filter.subjectType = subjectType;

        const reports = await Report.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: reports.length, data: reports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Cập nhật trạng thái báo cáo (Admin)
exports.updateReportStatus = async (req, res) => {
    try {
        const resolverId = req.user._id; // ID của Admin
        const { status } = req.body;
        
        if (['RESOLVED', 'REJECTED'].includes(status) === false) {
             return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            { status, resolverId },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ success: true, message: `Report updated to ${status}`, data: updatedReport });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};