/**
 * Routes cho Orders/Transactions
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Tạo order mới
router.post('/', orderController.createOrder);

// Thanh toán order
router.post('/:id/payment', orderController.processPayment);

// Tải hợp đồng PDF
router.get('/:id/contract', orderController.generateContract);

// Lấy danh sách orders của user
router.get('/user/:userId', orderController.getUserOrders);

module.exports = router;