const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/orders');

// Import models để register (trước connect)
require('./models/schemas/User');      // Đăng ký User
require('./models/schemas/Listing');   // Đăng ký Listing
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
app.use('/orders', orderRoutes);

// Error handler (giữ nguyên)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Transaction Service running on http://localhost:${port}`);
  console.log('Endpoints:');
  console.log('- POST /orders (tạo order)');
  console.log('- POST /orders/:id/payment (thanh toán giả lập)');
  console.log('- GET /orders/:id/contract (tải PDF hợp đồng)');
});