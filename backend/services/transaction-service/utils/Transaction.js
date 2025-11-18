const mongoose = require('mongoose');
const TransactionModel = require('../models/schemas/Transaction');
const FeeConfig = require('../models/schemas/FeeConfig');

const castObjectId = (idString) => {
  if (!idString) return null;
  try {
    return new mongoose.Types.ObjectId(idString);
  } catch (err) {
    console.warn(`Invalid ObjectId: ${idString}`);
    return null;
  }
};

// Hàm tính phí/hoa hồng hiện tại
const calculateFee = async (type, price) => {
  // Tìm cấu hình phí active phù hợp với loại giao dịch
  const config = await FeeConfig.findOne({
    type: type.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    $or: [{ endDate: { $gte: new Date() } }, { endDate: null }]
  }) || await FeeConfig.findOne({ type: 'DEFAULT', isActive: true }); // Fallback về DEFAULT

  const rate = config ? config.rate : 0.05; // Mặc định 5% nếu không tìm thấy
  const amount = price * rate;
  return { rate, amount };
};

const Transaction = {};

Transaction.createNew = async (userId, sellerId, listingId, price, type) => {
  const castUserId = castObjectId(userId);
  const castSellerId = castObjectId(sellerId);
  const castListingId = castObjectId(listingId);

  if (!castUserId || !castSellerId || !castListingId) {
    throw new Error('Invalid ObjectId for userId, sellerId, or listingId');
  }

  // 🆕 BỔ SUNG: Tính phí khi tạo Transaction
  const { rate, amount } = await calculateFee(type, price);

  return await TransactionModel.create({
    userId: castUserId,
    sellerId: castSellerId,
    listingId: castListingId,
    price,
    type,
    commissionRate: rate, // Lưu tỷ lệ phí
    commissionAmount: amount // Lưu số tiền phí
  });
};

// 🆕 BỔ SUNG: Lấy lịch sử giao dịch (Người mua HOẶC Người bán)
Transaction.findHistoryByUserId = async (userId, filters = {}) => {
  const castId = castObjectId(userId);
  if (!castId) {
    throw new Error('Invalid user ID');
  }

  const query = {
    $or: [
      { userId: castId },
      { sellerId: castId }
    ]
  };

  if (filters.status) {
    query.status = filters.status;
  }

  return await TransactionModel.find(query)
    .sort({ createdAt: -1 })
    .populate({
      path: 'listingId',
      select: 'title price type',
    })
    .exec();
};

Transaction.findById = async (id) => {
  return await TransactionModel.findById(id);
};


Transaction.findByIdPopulated = async (id) => {
  return await TransactionModel.findById(id)
    .populate({
      path: 'userId',
      select: 'profile.email profile.username profile.phonenumber' // Chỉ lấy thông tin cần thiết, không lấy password và Tokens
    })
    .populate({
      path: 'sellerId',
      select: 'profile.email profile.username profile.phonenumber'
    })
    .populate({
      path: 'listingId',
      select: 'title price type category condition location description'
    });
};

Transaction.updateById = async (id, updates) => {
  return await TransactionModel.findByIdAndUpdate(id, updates, { new: true });
}

Transaction.updateByIdPopulated = async (id, updates) => {
  return await TransactionModel.findByIdAndUpdate(id, updates, { new: true }).populate('userId sellerId listingId');
}


module.exports = Transaction;