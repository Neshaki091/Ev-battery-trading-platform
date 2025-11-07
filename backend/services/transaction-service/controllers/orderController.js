// controllers/orderController.js
const Transaction = require('../utils/Transaction');
const pdfGenerator = require('../utils/pdfGenerator');
const axios = require('axios');

// SỬA 2: Sửa toàn bộ hàm createOrder
const createOrder = async (req, res) => {
  try {
    // Lấy listingId từ body, nhưng userId từ token
    const { listingId, type } = req.body;
    const userId = req.user._id; // Lấy từ middleware (an toàn)

    if (!listingId || !type) {
      return res.status(400).json({ success: false, error: 'Missing required fields: listingId, type' });
    }

    let listingInfo;
    try {
      // Cần truyền token để Listing Service có thể xác thực (getListingById yêu cầu đăng nhập)
      const token = req.headers.authorization;
      // Trong Docker, dùng tên service thay vì localhost
      const listingServiceUrl = process.env.LISTING_SERVICE_URL || 'http://listing-service:5000';
      const response = await axios.get(`${listingServiceUrl}/${listingId}`, {
        headers: { Authorization: token }
      });
      listingInfo = response.data;
    } catch (err) {
      console.error('Error fetching listing data:', err.message);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
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
    const userRole = req.user.role;

    const order = await Transaction.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.userId.toString() !== userId &&
      order.sellerId.toString() !== userId &&
      userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({ success: false, error: 'Order must be paid to generate contract' });
    }

    // Giả sử pdfGenerator đã được sửa để lấy thêm thông tin User/Listing
    const populatedOrder = await Transaction.findByIdPopulated(id); 

    pdfGenerator.generate(res, populatedOrder);
  } catch (error) {
    console.error('Generate contract error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 🆕 BỔ SUNG: API Lấy Lịch sử Giao dịch
const getOrderHistory = async (req, res) => {
    try {
      const userId = req.user._id; 
      const status = req.query.status; 
  
      const history = await Transaction.findHistoryByUserId(userId, { status });
  
      res.status(200).json({
        success: true,
        count: history.length,
        data: history
      });
    } catch (error) {
      console.error('Get order history error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  
  module.exports = {
    createOrder,
    processPayment,
    generateContract,
    getOrderHistory, 
  };