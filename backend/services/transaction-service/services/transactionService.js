const mongoose = require('mongoose');
const Transaction = require('../models/schemas/Transaction');

// Tạo transaction
const createTransaction = async (data) => {
  if (!['xe', 'pin'].includes(data.type)) {
    throw new Error('Type phải là "xe" hoặc "pin"');
  }
  
  if (!data.price || data.price <= 0) {
    throw new Error('Giá phải lớn hơn 0');
  }
  
  const transaction = new Transaction({
    userId: new mongoose.Types.ObjectId(data.userId),
    sellerId: new mongoose.Types.ObjectId(data.sellerId),
    listingId: new mongoose.Types.ObjectId(data.listingId),
    price: parseFloat(data.price),
    type: data.type,
    status: 'pending'
  });
  
  await transaction.save();
  return transaction;
};

// Lấy transaction theo ID
const getTransactionById = async (id) => {
  const transaction = await Transaction.findById(id);
  if (!transaction) {
    throw new Error('Không tìm thấy giao dịch');
  }
  return transaction;
};

// Thanh toán
const processPayment = async (id) => {
  const transaction = await Transaction.findById(id);
  if (!transaction) {
    throw new Error('Không tìm thấy giao dịch');
  }
  if (transaction.status !== 'pending') {
    throw new Error('Giao dịch không ở trạng thái chờ thanh toán');
  }
  
  transaction.status = 'paid';
  transaction.paidAt = new Date();
  await transaction.save();
  return transaction;
};

// Danh sách transactions của user
const getTransactionsByUser = async (userId) => {
  return await Transaction.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
};

module.exports = {
  createTransaction,
  getTransactionById,
  processPayment,
  getTransactionsByUser
};


