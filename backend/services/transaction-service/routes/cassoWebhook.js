const express = require('express');
const router = express.Router();
const cassoController = require('../controllers/cassoController');

router.post('/', cassoController.handleWebhook);

module.exports = router;

