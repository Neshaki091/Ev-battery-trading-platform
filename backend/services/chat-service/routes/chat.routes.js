// routes/chat.routes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authmiddleware } = require('../shared/authmiddleware');

// Tất cả routes đều yêu cầu authentication
router.post('/rooms', authmiddleware, chatController.createOrGetRoom);
router.get('/rooms', authmiddleware, chatController.getUserRooms);
router.post('/rooms/:roomId/messages', authmiddleware, chatController.sendMessage);
router.get('/rooms/:roomId/messages', authmiddleware, chatController.getMessages);

// Notification routes
router.get('/notifications', authmiddleware, chatController.getNotifications);

module.exports = router;


