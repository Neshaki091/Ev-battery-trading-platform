
// src/routes/analytics.routes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authmiddleware, } = require('../../shared/authmiddleware');
const { allowAdminRole } = require('../../shared/adminMiddleware');

// Chỉ Admin mới được truy cập các số liệu thống kê
router.get('/summary', authmiddleware, allowAdminRole, analyticsController.getStatsSummary);

// (Có thể thêm route cho Top Listings, Top Users, v.v.)

module.exports = router;