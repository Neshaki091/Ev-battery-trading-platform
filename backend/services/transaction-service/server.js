const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin.routes'); // 🆕 BỔ SUNG: Import Admin Routes
const cassoWebhookRoutes = require('./routes/cassoWebhook'); // 🆕 BỔ SUNG: Import Casso Webhook Routes

require('./models/schemas/FeeConfig'); // 🆕 BỔ SUNG: Register FeeConfig
require('./models/schemas/Transaction'); // Đăng ký Transaction (sẽ tự import User/Listing)

const app = express();
const port = 3001;

// Connection string (giữ nguyên)
const mongoURI = 'mongodb://mongodb:27017/transaction_db'; //'mongodb+srv://tranvantai:14122004@cluster0.z0zba9e.mongodb.net/evtrading_platform?retryWrites=true&w=majority&appName=Cluster0';

// Connect sau khi register models
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// 🆕 BỔ SUNG: Middleware để lưu raw body cho webhook signature verification
app.use('/webhooks/casso', bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Middleware và routes (giữ nguyên)
app.use(bodyParser.json());
// 🆕 BỔ SUNG: Admin routes (dùng tiền tố /admin)
app.use('/admin', adminRoutes);
// Order/Transaction routes
app.use('/orders', orderRoutes);
// 🆕 BỔ SUNG: Casso Webhook routes
app.use('/webhooks/casso', cassoWebhookRoutes);

// Error handler (giữ nguyên)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Transaction Service running on http://localhost:${port}`);
  console.log('Endpoints:');
  console.log('- GET /orders/history (Lịch sử giao dịch)');
  console.log('- POST /orders (Tạo order)');
  console.log('- POST /orders/:id/payment (Thanh toán)');
  console.log('- GET /orders/:id/contract (Tải PDF hợp đồng)');
  console.log('- GET /admin/fees (Quản lý Phí)');
  console.log('- POST /webhooks/casso (Webhook Casso - Tự động cập nhật thanh toán)'); // 🆕 BỔ SUNG
});