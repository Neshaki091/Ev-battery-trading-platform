const transactionService = require('../services/transactionService');
const pdfGenerator = require('../utils/pdfGenerator');

// Tạo order
const createOrder = async (req, res) => {
  try {
    const { userId, sellerId, listingId, price, type } = req.body;
    
    if (!userId || !sellerId || !listingId || !price || !type) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin bắt buộc' });
    }
    
    const order = await transactionService.createTransaction({ userId, sellerId, listingId, price, type });
    
    res.status(201).json({ success: true, data: { order } });
    
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Thanh toán
const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await transactionService.processPayment(id);
    res.json({ success: true, data: { order } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Tải hợp đồng PDF
const generateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await transactionService.getTransactionById(id);
    
    if (order.status !== 'paid') {
      return res.status(400).json({ success: false, error: 'Order phải được thanh toán trước' });
    }
    
    pdfGenerator.generate(res, {
      id: order._id.toString(),
      userId: order.userId.toString(),
      sellerId: order.sellerId.toString(),
      listingId: order.listingId.toString(),
      price: order.price,
      type: order.type,
      status: order.status,
      paidAt: order.paidAt
    });
    
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Danh sách orders của user
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await transactionService.getTransactionsByUser(userId);
    res.json({ success: true, data: { orders } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { createOrder, processPayment, generateContract, getUserOrders };