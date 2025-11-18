
require('dotenv').config();
const express = require('express');

// 3. Import các routes của service tìm kiếm
// const searchRoutes = require('./src/routes/searchRoutes');
//  // <-- THÊM: Import file định nghĩa routes
const searchRoutes = require('./routes/searchRoutes');
// 4. Khởi tạo ứng dụng Express
const app = express();

// 5. Cấu hình các Middleware 
app.use(express.json()); // Middleware để parse JSON từ request body

// 6. Định nghĩa các Routes của API
// Sử dụng các routes từ file searchRoutes cho tất cả các đường dẫn bắt đầu bằng /api/v1/search
app.use('/', searchRoutes);

// 7. Route kiểm tra tình trạng server (Health Check) - Đã cập nhật nội dung
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Search Service is healthy and ready to go!', // <-- THAY ĐỔI: Thông điệp cho Search Service
    timestamp: new Date().toISOString(),
  });
});


// 9. Xuất ứng dụng để có thể sử dụng ở file khác (ví dụ: server.js)
module.exports = app;