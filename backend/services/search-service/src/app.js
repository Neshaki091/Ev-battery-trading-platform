
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // <-- THÊM: Thư viện để cho phép gọi API từ các domain khác

// 3. Import các routes của service tìm kiếm
// const searchRoutes = require('./src/routes/searchRoutes');
//  // <-- THÊM: Import file định nghĩa routes
const searchRoutes = require('./routes/searchRoutes');
// 4. Khởi tạo ứng dụng Express
const app = express();

// 5. Cấu hình các Middleware
app.use(cors()); // <-- THÊM: Sử dụng middleware CORS
app.use(express.json()); // Middleware để parse JSON từ request body

// 6. Định nghĩa các Routes của API
// Sử dụng các routes từ file searchRoutes cho tất cả các đường dẫn bắt đầu bằng /api/v1/search


// app.use('/api/v1/search', searchRoutes);
app.use('/api/search', searchRoutes);
// 7. Route kiểm tra tình trạng server (Health Check) - Đã cập nhật nội dung
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Search Service is healthy and ready to go!', // <-- THAY ĐỔI: Thông điệp cho Search Service
    timestamp: new Date().toISOString(),
  });
});

// 8. Route chính - Đã cập nhật nội dung
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the Search Service!</h1><p>Go to <a href="/api/search/listings">/api/search/listings</a> to start searching.</p>'); // <-- THAY ĐỔI: Hướng dẫn đến API tìm kiếm
});

// 9. Xuất ứng dụng để có thể sử dụng ở file khác (ví dụ: server.js)
module.exports = app;