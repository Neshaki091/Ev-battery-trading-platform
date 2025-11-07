const express = require('express');
const orderController = require('../controllers/orderController');
const { authmiddleware } = require('../utils/authmiddleware'); // Cần authmiddleware

const router = express.Router();

// 🆕 BỔ SUNG: Lịch sử giao dịch của người dùng đang đăng nhập
router.get('/history', authmiddleware, orderController.getOrderHistory); 

// Routes Order CRUD/Actions
router.post('/', authmiddleware, orderController.createOrder);
router.post('/:id/payment', authmiddleware, orderController.processPayment);
router.get('/:id/contract', authmiddleware, orderController.generateContract);

module.exports = router;