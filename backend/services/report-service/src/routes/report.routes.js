// reports-service/src/routes/report.routes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authmiddleware } = require('../../shared/authmiddleware');
const { allowAdminRole } = require('../../shared/adminMiddleware');

// Public Route
router.post('/', authmiddleware, reportController.createReport);

// Admin Routes (Yêu cầu Admin Role)
router.get('/', authmiddleware, allowAdminRole, reportController.getAllReports);
router.put('/:id/status', authmiddleware, allowAdminRole, reportController.updateReportStatus);

module.exports = router;
