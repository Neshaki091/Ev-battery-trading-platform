const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin.routes'); // 🆕 BỔ SUNG: Import Admin Routes

// Import models để register (trước connect)
require('./models/schemas/User');      // Đăng ký User
require('./models/schemas/Listing');   // Đăng ký Listing
require('./models/schemas/FeeConfig'); // 🆕 BỔ SUNG: Register FeeConfig
require('./models/schemas/Transaction'); // Đăng ký Transaction (sẽ tự import User/Listing)

const app = express();
const port = 3001;

// Connection string (giữ nguyên)
const mongoURI = 'mongodb+srv://tranvantai:14122004@cluster0.z0zba9e.mongodb.net/evtrading_platform?retryWrites=true&w=majority&appName=Cluster0';

// Connect sau khi register models
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware và routes (giữ nguyên)
app.use(bodyParser.json());
// 🆕 BỔ SUNG: Admin routes (dùng tiền tố /admin)
app.use('/admin', adminRoutes);
// Order/Transaction routes
app.use('/orders', orderRoutes);

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
});