const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Routes
router.post('/', orderController.createOrder);
router.post('/:id/payment', orderController.processPayment);
router.get('/:id/contract', orderController.generateContract);

module.exports = router;