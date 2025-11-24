const mongoose = require('mongoose');
const Transaction = require('../models/schemas/Transaction');

<<<<<<< HEAD
=======

>>>>>>> temp
// Tạo transaction
const createTransaction = async (data) => {
  if (!['xe', 'pin', ].includes(data.type)) {
    throw new Error('Type phải là "xe" hoặc "pin"');
  }
<<<<<<< HEAD
  
  if (!data.price || data.price <= 0) {
    throw new Error('Giá phải lớn hơn 0');
  }
  
=======
 
  if (!data.price || data.price <= 0) {
    throw new Error('Giá phải lớn hơn 0');
  }
 
>>>>>>> temp
  const transaction = new Transaction({
    userId: new mongoose.Types.ObjectId(data.userId),
    sellerId: new mongoose.Types.ObjectId(data.sellerId),
    listingId: new mongoose.Types.ObjectId(data.listingId),
    price: parseFloat(data.price),
    type: data.type,
    status: 'pending'
  });
<<<<<<< HEAD
  
=======
 
>>>>>>> temp
  await transaction.save();
  return transaction;
};

<<<<<<< HEAD
=======

>>>>>>> temp
// Lấy transaction theo ID
const getTransactionById = async (id) => {
  const transaction = await Transaction.findById(id);
  if (!transaction) {
    throw new Error('Không tìm thấy giao dịch');
  }
  return transaction;
};

<<<<<<< HEAD
=======

>>>>>>> temp
// Thanh toán
const processPayment = async (id) => {
  const transaction = await Transaction.findById(id);
  if (!transaction) {
    throw new Error('Không tìm thấy giao dịch');
  }
  if (transaction.status !== 'pending') {
    throw new Error('Giao dịch không ở trạng thái chờ thanh toán');
  }
<<<<<<< HEAD
  
  transaction.status = 'paid';
  transaction.paidAt = new Date();
  await transaction.save();
  return transaction;
};

=======


  transaction.status = 'paid';
  transaction.paidAt = new Date();
  await transaction.save();


  // 🆕 Publish event to RabbitMQ for analytics
  try {
    const { publishEvent } = require('../utils/mqService');
    await publishEvent('transaction_paid', {
      transactionId: transaction._id,
      orderId: transaction._id,
      userId: transaction.userId,
      listingId: transaction.listingId,
      amount: transaction.amount,
      status: 'paid',
      paidAt: transaction.paidAt,
      paymentMethod: 'manual'
    });
    console.log(`[MQ] Published transaction_paid event for transaction ${id}`);
  } catch (error) {
    console.error('Error publishing transaction_paid event:', error.message);
  }


  return transaction;
};


>>>>>>> temp
// Danh sách transactions của user
const getTransactionsByUser = async (userId) => {
  return await Transaction.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
};

<<<<<<< HEAD
const markTransactionPaidFromCasso = async ({ orderId, payment }) => {
  const transaction = await Transaction.findById(orderId);

=======

const markTransactionPaidFromCasso = async ({ orderId, payment }) => {
  const transaction = await Transaction.findById(orderId);


>>>>>>> temp
  if (!transaction) {
    throw new Error('Không tìm thấy giao dịch từ mã order trong webhook Casso');
  }

<<<<<<< HEAD
=======

>>>>>>> temp
  if (transaction.status === 'cancelled') {
    throw new Error('Giao dịch đã bị hủy, không thể cập nhật thanh toán');
  }

<<<<<<< HEAD
  const paidAt = payment.paidAt ? new Date(payment.paidAt) : new Date();

=======

  const paidAt = payment.paidAt ? new Date(payment.paidAt) : new Date();


>>>>>>> temp
  transaction.status = 'paid';
  transaction.paidAt = paidAt;
  transaction.cassoPayment = {
    transId: payment.transId,
    description: payment.description,
    amount: payment.amount,
    bankCode: payment.bankCode,
    paidAt,
    raw: payment.raw
  };

<<<<<<< HEAD
  await transaction.save();

  return transaction;
};

=======

  await transaction.save();


  // 🆕 Publish event to RabbitMQ for analytics
  try {
    const { publishEvent } = require('../utils/mqService');
    await publishEvent('transaction_paid', {
      transactionId: transaction._id,
      orderId: transaction._id,
      userId: transaction.userId,
      listingId: transaction.listingId,
      amount: transaction.amount,
      status: 'paid',
      paidAt: transaction.paidAt,
      paymentMethod: 'casso',
      cassoPayment: transaction.cassoPayment
    });
    console.log(`[MQ] Published transaction_paid event for order ${orderId}`);
  } catch (error) {
    console.error('Error publishing transaction_paid event:', error.message);
  }


  return transaction;
};


>>>>>>> temp
module.exports = {
  createTransaction,
  getTransactionById,
  processPayment,
  getTransactionsByUser,
  markTransactionPaidFromCasso
};


<<<<<<< HEAD
=======





>>>>>>> temp
