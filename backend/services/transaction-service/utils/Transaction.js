const mongoose = require('mongoose');
// Giả sử model của bạn nằm ở đường dẫn này
const TransactionModel = require('../models/schemas/Transaction');
const FeeConfig = require('../models/schemas/FeeConfig');

/**
 * Helper để chuyển chuỗi ID thành ObjectId một cách an toàn
 */
const castObjectId = (idString) => {
  if (!idString) return null;
  // Thêm kiểm tra 'isValid' để đảm bảo chuỗi đúng định dạng
  if (!mongoose.Types.ObjectId.isValid(idString)) {
    console.warn(`Invalid ObjectId string: ${idString}`);
    return null;
  }
  try {
    return new mongoose.Types.ObjectId(idString);
  } catch (err) {
    console.warn(`Error casting ObjectId: ${idString}`, err);
    return null;
  }
};

/**
 * Hàm tính phí/hoa hồng hiện tại
 */
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

// --- Khởi tạo đối tượng Transaction Service ---
const Transaction = {};

/**
 * Tạo một transaction mới
 */
Transaction.createNew = async (userId, sellerId, listingId, price, type) => {
  // Sử dụng hàm castObjectId an toàn
  const castUserId = castObjectId(userId);
  const castSellerId = castObjectId(sellerId);
  const castListingId = castObjectId(listingId);

  if (!castUserId || !castSellerId || !castListingId) {
    throw new Error('Invalid ObjectId for userId, sellerId, or listingId');
  }

  // Tính phí khi tạo Transaction
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

Transaction.markAsPaid = async (id) => {
  const transaction = await TransactionModel.findById(id);

  if (!transaction) {
    throw new Error('Không tìm thấy giao dịch');
  }

  // Đây là logic nghiệp vụ quan trọng (Nguyên nhân gây lỗi 400)
  if (transaction.status !== 'pending') {
    throw new Error('Giao dịch không ở trạng thái chờ thanh toán (có thể đã được thanh toán hoặc đã hủy)');
  }

  transaction.status = 'paid';
  transaction.paidAt = new Date();
  await transaction.save();
  return transaction;
};
/**
 * Lấy lịch sử giao dịch (Người mua HOẶC Người bán)
 * ĐÃ SỬA: Xóa bỏ .populate()
 */
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

  // === SỬA LỖI: Đã xóa .populate() ra khỏi đây ===
  // Service này chỉ trả về ID, không tham chiếu sang service khác.
  return await TransactionModel.find(query)
    .sort({ createdAt: -1 })
    .exec();
};

/**
 * Tìm Transaction theo ID (không populate)
 */
Transaction.findById = async (id) => {
  return await TransactionModel.findById(id);
};

/**
 * Tìm Transaction theo ID để populate (dùng cho PDF)
 * ĐÃ SỬA: Xóa bỏ .populate()
 * * LƯU Ý: Hàm này giờ hoạt động giống hệt findById.
 * Bạn PHẢI sửa logic trong `generateContract` (controller)
 * để gọi API sang User/Listing service.
 */
Transaction.findByIdPopulated = async (id) => {
  // === SỬA LỖI: Đã xóa tất cả .populate() ===
  return await TransactionModel.findById(id);
};

/**
 * Cập nhật Transaction
 */
Transaction.updateById = async (id, updates) => {
  return await TransactionModel.findByIdAndUpdate(id, updates, { new: true });
}

/**
 * Cập nhật Transaction (trước đây dùng để populate)
 * ĐÃ SỬA: Xóa bỏ .populate()
 */
Transaction.deleteById = async (id) => {
  return await TransactionModel.findByIdAndDelete(id);
};

Transaction.updateByIdPopulated = async (id, updates) => {
  // === SỬA LỖI: Đã xóa .populate() ===
  return await TransactionModel.findByIdAndUpdate(id, updates, { new: true });
}

module.exports = Transaction;