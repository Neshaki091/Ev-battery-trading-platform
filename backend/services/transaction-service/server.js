/**
 * Transaction Service - Xử lý giao dịch mua hàng
 * Chức năng: Tạo order → Thanh toán → Hợp đồng PDF
 */

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Import routes
const orderRoutes = require('./routes/orders');

// Import models
require('./models/schemas/User');
require('./models/schemas/Listing');
require('./models/schemas/Transaction');

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://tranvantai:14122004@cluster0.z0zba9e.mongodb.net/evtrading_platform?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ Kết nối MongoDB thành công!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Transaction Service',
    version: '1.0.0',
    status: 'running',
    description: 'Xử lý giao dịch: Mua hàng → Thanh toán → Hợp đồng điện tử',
    features: [
      'Tạo order mua hàng',
      'Thanh toán đơn hàng',
      'Tạo hợp đồng PDF chuyên nghiệp'
    ],
    endpoints: {
      createOrder: 'POST /orders',
      payment: 'POST /orders/:id/payment',
      contract: 'GET /orders/:id/contract',
      userOrders: 'GET /orders/user/:userId'
    }
  });
});

// Routes
app.use('/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint không tồn tại',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Lỗi server',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(' Transaction Service - Xử lý Giao dịch');
  console.log('═══════════════════════════════════════════════');
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log(' Chức năng:');
  console.log(' 1️⃣  Tạo order (mua hàng)');
  console.log('  2️⃣  Thanh toán');
  console.log('  3️⃣  Tạo hợp đồng PDF');
  console.log('');
  console.log(' API Endpoints:');
  console.log('  - POST   /orders                  Tạo order mua hàng');
  console.log('  - POST   /orders/:id/payment      Thanh toán order');
  console.log('  - GET    /orders/:id/contract     Tải hợp đồng PDF');
  console.log('  - GET    /orders/user/:userId     Danh sách order của user');
  console.log('  - GET    /                        Service info');
  console.log('');
  console.log(' Note: Listing (tin đăng) thuộc listing-service');
  console.log('═══════════════════════════════════════════════');
  console.log('');
});