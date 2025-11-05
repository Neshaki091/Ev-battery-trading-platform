// controllers/orderController.js
const Transaction = require('../utils/Transaction');
const pdfGenerator = require('../utils/pdfGenerator');
const axios = require('axios'); // SỬA 1: Import axios

// SỬA 2: Sửa toàn bộ hàm createOrder
const createOrder = async (req, res) => {
  try {
    // Lấy listingId từ body, nhưng userId từ token
    const { listingId, type } = req.body;
    const userId = req.user._id; // Lấy từ middleware (an toàn)

    if (!listingId || !type) {
      return res.status(400).json({ success: false, error: 'Missing required fields: listingId, type' });
    }

    // SỬA 3: Dùng axios gọi Listing-service để lấy thông tin tin cậy
    let listingInfo;
    try {
      // Giả sử Listing-service chạy ở port 5000 (gọi nội bộ)
      const response = await axios.get(`http://localhost:5000/${listingId}`);
      // LƯU Ý: Sửa lại URL /:id cho đúng với route 'getListingById' của bạn
      listingInfo = response.data;
    } catch (err) {
      console.error('Error fetching listing data:', err.message);
      return res.status(404).json({ success: false, error: 'Listing not found or Listing service is down' });
    }

    // Kiểm tra xem listingInfo có đúng format không (ví dụ response.data.data)
    // Giả sử data trả về là { data: { price: 1000, user_id: '...' } }
    const listingData = listingInfo.data || listingInfo;

    const price = listingData.price; // Lấy giá từ DB (an toàn)
    const sellerId = listingData.user_id; // Lấy sellerId từ DB (an toàn)

    // Ngăn người dùng tự mua hàng của mình
    if (userId.toString() === sellerId.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot buy your own listing.' });
    }

    // Tạo đơn hàng với thông tin đã xác thực
    const order = await Transaction.createNew(userId, sellerId, listingId, parseFloat(price), type);

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// SỬA 4: Sửa processPayment và generateContract để kiểm tra quyền
const processPayment = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user._id; // Lấy user từ token

    const order = await Transaction.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // KIỂM TRA QUYỀN: Chỉ người mua mới được trả tiền
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied. You are not the buyer.' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Order is not pending' });
    }

    const updates = { status: 'paid', paidAt: new Date() };
    const updatedOrder = await Transaction.updateById(id, updates);

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    // ...
  }
};

const generateContract = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role; // Lấy role (nếu đã sửa token)

    const order = await Transaction.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // KIỂM TRA QUYỀN: Chỉ người mua, người bán, hoặc admin mới được xem
    if (order.userId.toString() !== userId &&
      order.sellerId.toString() !== userId &&
      userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({ success: false, error: 'Order must be paid to generate contract' });
    }

    // ... (logic tạo PDF giữ nguyên) ...
    pdfGenerator.generate(res, order);
  } catch (error) {
    // ...
  }
};

module.exports = {
  createOrder,
  processPayment,
  generateContract
};