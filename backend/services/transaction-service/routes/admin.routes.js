// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const feeController = require('../controllers/adminFeeController');
const { authmiddleware, } = require('../shared/authmiddleware');
const { allowAdminRole } = require('../shared/adminMiddleware');
const paymentController = require('../controllers/adminPaymentController');
// Tất cả các route admin đều yêu cầu Auth và Admin Role
router.use(authmiddleware, allowAdminRole);

// Route Quản lý Phí (API Quản lý Phí & Hoa hồng)
router.get('/fees', feeController.getAllFeeConfigs);
router.post('/fees', feeController.createFeeConfig);
router.put('/fees/:id', feeController.updateFeeConfig);
router.delete('/fees/:id', feeController.deleteFeeConfig);

// (Có thể thêm các Admin Routes khác như getAllTransactions ở đây)
router.get('/payments/pending', paymentController.getPendingPayments);
router.get('/payments/history', paymentController.getPaymentHistory);
router.post('/payments/:transactionId/confirm', paymentController.confirmPayment);
module.exports = router;
