// controllers/orderController.js
const TransactionUtil = require('../utils/Transaction');
const pdfGenerator = require('../utils/pdfGenerator');
const axios = require('axios');
const mongoose = require('mongoose');
const { publishEvent } = require('../utils/mqService');

/**
 * Tạo Đơn hàng (An toàn)
 * (Hàm này của bạn đã SỬA ĐÚNG - Giữ nguyên)
 */
const createOrder = async (req, res) => {
  try {
    const { listingId, type } = req.body;
    const userId = req.user._id; // Lấy từ middleware (an toàn)
    const token = req.headers.authorization;

    if (!listingId || !type) {
      return res.status(400).json({ success: false, error: 'Thiếu listingId hoặc type' });
    }
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ success: false, error: 'Listing ID không hợp lệ' });
    }

    // === KIỂM TRA BẮT BUỘC: firstName và lastName phải được cập nhật ===
    try {
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://backend-auth-service-1:3000';
      const userRes = await axios.get(`${userServiceUrl}/seller/${userId}`, {
        headers: { Authorization: token }
      });

      const userData = userRes.data;
      const firstName = userData.firstName || '';
      const lastName = userData.lastName || '';

      if (!firstName.trim() || !lastName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Bạn phải cập nhật đầy đủ Họ và Tên trước khi thực hiện giao dịch. Vui lòng cập nhật thông tin tại trang Profile.',
          requiresProfileUpdate: true
        });
      }
    } catch (userErr) {
      console.error('Lỗi khi kiểm tra thông tin user:', userErr.message);
      // Nếu không lấy được thông tin user, vẫn cho phép tạo order nhưng cảnh báo
      // Hoặc có thể return lỗi tùy yêu cầu nghiệp vụ
    }

    // 1. Gọi nội bộ sang Listing Service
    let listingInfo;
    try {
      const token = req.headers.authorization;
      const listingServiceUrl = process.env.LISTING_SERVICE_URL || 'http://backend-listing-service-1:5000';

      const response = await axios.get(`${listingServiceUrl}/${listingId}`, {
        headers: { Authorization: token }
      });

      listingInfo = response.data.data || response.data;

    } catch (err) {
      console.error('Lỗi khi gọi Listing service:', err.message);
      if (err.response) {
        console.error('Listing Service Response:', err.response.data);
        return res.status(err.response.status).json({
          success: false,
          error: `Listing service trả về lỗi ${err.response.status}: ${err.response.data?.message || err.message}`
        });
      }
      return res.status(404).json({ success: false, error: 'Không tìm thấy Listing hoặc Listing service bị lỗi' });
    }

    // 2. Trích xuất thông tin Price và SellerId
    if (!listingInfo) {
      console.error('Data từ Listing service là rỗng hoặc undefined.');
      return res.status(500).json({
        success: false,
        error: 'Không thể lấy được thông tin từ Listing service (data rỗng).'
      });
    }

    const price = listingInfo.price;
    let sellerId = listingInfo.user_id || listingInfo.sellerId || listingInfo.userId;

    if (!sellerId && listingInfo.user) {
      if (typeof listingInfo.user === 'object' && listingInfo.user._id) {
        sellerId = listingInfo.user._id;
      } else if (typeof listingInfo.user === 'string') {
        sellerId = listingInfo.user;
      }
    }

    // KIỂM TRA AN TOÀN:
    if (!price || price <= 0 || !sellerId) {
      console.error('Data từ Listing service không hợp lệ (Thiếu Price hoặc SellerId):', listingInfo);
      return res.status(500).json({
        success: false,
        error: 'Không thể xác định Price hoặc SellerId từ Listing service (format data sai).'
      });
    }

    // 3. Kiểm tra logic nghiệp vụ
    if (userId.toString() === sellerId.toString()) {
      return res.status(400).json({ success: false, error: 'Bạn không thể tự mua tin đăng của mình.' });
    }

    // 4. Tạo đơn hàng
    // (Code này của bạn đã SỬA ĐÚNG)
    const order = await TransactionUtil.createNew(
      userId.toString(), // 1. userId (phải là string)
      sellerId,          // 2. sellerId (đã là string)
      listingId,         // 3. listingId (đã là string)
      parseFloat(price), // 4. price
      type               // 5. type
    );

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    if (error.name === 'ValidationError' || error.message.includes('Type phải là')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Xử lý Thanh toán (Admin hoặc Người mua)
 * (Hàm này của bạn đã ĐÚNG - Giữ nguyên)
 * (Lỗi 400 là hành vi đúng nếu đơn hàng không ở trạng thái 'pending')
 */
const processPayment = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user._id;
    const token = req.headers.authorization; // Cần token để gọi service khác

    const order = await TransactionUtil.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra quyền (OK)
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Access denied. Bạn không phải người mua.' });
    }

    // Kiểm tra status (OK)
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Đơn hàng này không còn ở trạng thái chờ thanh toán.' });
    }

    // === KIỂM TRA BẮT BUỘC: firstName và lastName phải được cập nhật ===
    try {
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://backend-auth-service-1:3000';
      const userRes = await axios.get(`${userServiceUrl}/userprofile/${userId}`, {
        headers: { Authorization: token }
      });

      const userData = userRes.data;
      const firstName = userData.firstName || '';
      const lastName = userData.lastName || '';

      if (!firstName.trim() || !lastName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Bạn phải cập nhật đầy đủ Họ và Tên trước khi thanh toán. Vui lòng cập nhật thông tin tại trang Profile.',
          requiresProfileUpdate: true
        });
      }
    } catch (userErr) {
      console.error('Lỗi khi kiểm tra thông tin user:', userErr.message);
      // Nếu không lấy được thông tin user, vẫn cho phép thanh toán nhưng cảnh báo
      // Hoặc có thể return lỗi tùy yêu cầu nghiệp vụ
    }

    // === ⭐️ BƯỚC KIỂM TRA QUAN TRỌNG NHẤT (THÊM MỚI) ===
    const listingId = order.listingId;
    const listingServiceUrl = process.env.LISTING_SERVICE_URL || 'http://backend-listing-service-1:5000';

    try {
      const response = await axios.get(`${listingServiceUrl}/${listingId}`, {
        headers: { Authorization: token, 'x-internal-key': process.env.INTERNAL_API_KEY  }
      });
      const listingData = response.data.data || response.data;

      // Nếu listing không còn 'Active' (ví dụ: đã 'Sold' hoặc 'Hidden')
      if (!listingData || listingData.status !== 'Active') {
        console.warn(`[TransactionService] Thanh toán bị từ chối cho đơn ${id}. Listing ${listingId} không còn khả dụng (Status: ${listingData?.status}).`);

        // Hủy đơn hàng 'pending' này vì nó không còn giá trị
        await TransactionUtil.deleteById(id);

        return res.status(400).json({
          success: false,
          error: 'Thanh toán thất bại. Tin đăng này đã được bán hoặc không còn khả dụng.'
        });
      }
    } catch (err) {
      console.error(`[TransactionService] Lỗi nghiêm trọng khi kiểm tra Listing ${listingId} trước khi thanh toán.`, err.message);
      return res.status(500).json({ success: false, error: 'Lỗi khi xác thực tin đăng. Vui lòng thử lại.' });
    }
    // === KẾT THÚC BƯỚC KIỂM TRA ===
    

    // 1. ĐÁNH DẤU LÀ ĐÃ THANH TOÁN (Nếu an toàn)
    const updatedOrder = await TransactionUtil.markAsPaid(id);

    // 2. GỬI EVENT (OK)
    try {
      await publishEvent('transaction_paid', {
        transactionId: updatedOrder._id,
        price: updatedOrder.price,
        commissionAmount: updatedOrder.commissionAmount
      });
    } catch (error) {
      console.error('Error publishing transaction_paid event:', error.message);
    }

    // 3. CẬP NHẬT LISTING SANG 'SOLD' (OK)
    try {
      console.log(`[TransactionService] Thanh toán ${id} thành công. Bắt đầu cập nhật Listing ${listingId}...`);
      await axios.put(
        `${listingServiceUrl}/${listingId}/status`,
        { status: 'Sold' },
        { headers: { Authorization: token, 'x-internal-key': process.env.INTERNAL_API_KEY  } }
      );
      console.log(`[TransactionService] Đã cập nhật Listing ${listingId} thành công.`);
    } catch (listingError) {
      console.error(`[TransactionService] LỖI NGHIÊM TRỌNG: Thanh toán ${id} THÀNH CÔNG, nhưng FAILED khi cập nhật status cho Listing ${listingId}.`);
      console.error(listingError.message);
    }

    // 4. 🆕 CỘNG TIỀN VÀO VÍ SELLER
    try {
      const sellerAmount = updatedOrder.price - (updatedOrder.commissionAmount || 0);
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://backend-auth-service-1:3000';

      console.log(`[TransactionService] Bắt đầu cộng ${sellerAmount} đ vào ví seller ${updatedOrder.sellerId}...`);

      await axios.post(
        `${userServiceUrl}/wallet/add`,
        {
          userId: updatedOrder.sellerId.toString(),
          amount: sellerAmount
        },
        {
          headers: {
            'x-internal-key': process.env.INTERNAL_API_KEY || 'your-secret-internal-key'
          }
        }
      );

      console.log(`✅ Đã cộng ${sellerAmount.toLocaleString('vi-VN')} đ vào ví seller ${updatedOrder.sellerId}`);
    } catch (walletError) {
      console.error(`⚠️ LỖI khi cộng tiền vào ví seller ${updatedOrder.sellerId}:`, walletError.response?.data || walletError.message);
      // Không fail transaction, chỉ log lỗi để admin xử lý thủ công
    }

    res.json({ success: true, order: updatedOrder });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Xuất Hợp đồng (Admin, Người mua, Người bán)
 * === ĐÃ SỬA: Thay thế .populate() bằng các lệnh gọi API (axios) ===
 */
const generateContract = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user._id.toString();
    const userRole = req.user.role;
    const token = req.headers.authorization; // Lấy token để gọi service khác

    // 1. Lấy Transaction thô (raw) (không populate)
    const order = await TransactionUtil.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng' });
    }

    // 2. Kiểm tra quyền
    const isBuyer = order.userId.toString() === userId;
    const isSeller = order.sellerId.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({ success: false, error: 'Đơn hàng phải được thanh toán mới có thể xuất hợp đồng' });
    }

    // 2b. Yêu cầu cả hai bên đã ký điện tử trước khi xuất hợp đồng
    const hasBuyerSignature = order.buyerSignature && order.buyerSignature.signedAt;
    const hasSellerSignature = order.sellerSignature && order.sellerSignature.signedAt;

    if (!hasBuyerSignature || !hasSellerSignature) {
      return res.status(400).json({
        success: false,
        error: 'Hợp đồng chỉ được tải sau khi cả Người mua và Người bán đã ký điện tử.',
        requiresSignature: true,
        buyerSigned: !!hasBuyerSignature,
        sellerSigned: !!hasSellerSignature
      });
    }

    // 3. === BẮT ĐẦU SỬA: Lấy dữ liệu từ các service khác ===
    // (Thay thế cho TransactionUtil.findByIdPopulated)

    // Lấy URL từ biến môi trường (Giả định URL của User Service)
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://backend-auth-service-1:3000';
    const listingServiceUrl = process.env.LISTING_SERVICE_URL || 'http://backend-listing-service-1:5000';

    // Gọi API song song, thêm .catch() để tránh 1 lỗi làm hỏng toàn bộ
    const [buyerRes, sellerRes, listingRes] = await Promise.all([
      axios.get(`${userServiceUrl}/userprofile/${order.userId}`, { headers: { Authorization: token } }).catch(e => ({ data: null })),
      axios.get(`${userServiceUrl}/seller/${order.sellerId}`, { headers: { Authorization: token } }).catch(e => ({ data: null })),
      axios.get(`${listingServiceUrl}/${order.listingId}`, { headers: { Authorization: token } }).catch(e => ({ data: null })),


    ]);
    console.log('buyerRes:', buyerRes.data);
    console.log('sellerRes:', sellerRes.data);
    console.log('listingRes:', listingRes.data);
    // Gộp dữ liệu lại thành đối tượng 'populatedOrder'
    const populatedOrder = {
      ...order.toObject(),
      id: order.id,
      userId: buyerRes.data
        ? { 
            _id: buyerRes.data._id || buyerRes.data.user_id, 
            profile: { 
              username: buyerRes.data.username, 
              email: buyerRes.data.email, 
              phonenumber: buyerRes.data.phonenumber,
              firstName: buyerRes.data.firstName || '',
              lastName: buyerRes.data.lastName || ''
            } 
          }
        : { _id: order.userId, profile: { username: 'User Bị Lỗi', email: 'N/A', phonenumber: 'N/A', firstName: '', lastName: '' } },

      sellerId: sellerRes.data
        ? { 
            _id: sellerRes.data.user_id || sellerRes.data._id, 
            profile: { 
              username: sellerRes.data.username, 
              email: sellerRes.data.email, 
              phonenumber: sellerRes.data.phonenumber,
              firstName: sellerRes.data.firstName || '',
              lastName: sellerRes.data.lastName || ''
            } 
          }
        : { _id: order.sellerId, profile: { username: 'User Bị Lỗi', email: 'N/A', phonenumber: 'N/A', firstName: '', lastName: '' } },

      listingId: listingRes.data
        ? { _id: listingRes.data._id, title: listingRes.data.title }
        : { _id: order.listingId, title: 'Tin đăng Bị Lỗi' }
    };
    // === KẾT THÚC SỬA ===

    pdfGenerator.generate(res, populatedOrder); // Hàm này sẽ stream PDF về client
  } catch (error) {
    console.error('Generate contract error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Lấy Lịch sử Giao dịch CÁ NHÂN
 * === ĐÃ SỬA: Lỗi "Invalid ObjectId" ===
 */
const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user._id; // Chỉ lấy của user đã login

    // === SỬA LỖI: Thêm .toString() ===
    // userId ở đây là [object Object], phải chuyển thành string
    const history = await TransactionUtil.findHistoryByUserId(userId.toString());

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
const cancelPendingOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user._id.toString();
    const token = req.headers.authorization;

    // 1. Tìm đơn hàng
    const order = await TransactionUtil.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng' });
    }

    // 2. Kiểm tra quyền sở hữu
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied. Bạn không thể hủy đơn hàng này.' });
    }

    // 3. Chỉ được hủy đơn hàng 'pending'
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Bạn chỉ có thể hủy đơn hàng ở trạng thái 'pending'. Đơn này đang ở trạng thái '${order.status}'.`
      });
    }

    // 4. KIỂM TRA ĐIỀU KIỆN (Như bạn yêu cầu):
    // Gọi sang Listing Service để xem tin đăng đã bị bán chưa
    const listingId = order.listingId;
    const listingServiceUrl = process.env.LISTING_SERVICE_URL || 'http://backend-listing-service-1:5000';
    let currentListingStatus = 'Unknown';

    try {
      const response = await axios.get(`${listingServiceUrl}/${listingId}`, {
        headers: { Authorization: token }
      });
      const listingData = response.data.data || response.data;
      if (listingData && listingData.status) {
        currentListingStatus = listingData.status;
      }
    } catch (err) {
      console.warn(`[TransactionService] Không thể kiểm tra status của Listing ${listingId}: ${err.message}`);
      // Dù lỗi vẫn tiếp tục (chỉ là không cập nhật lại listing)
    }

    // 5. Xóa đơn hàng 'pending'
    await TransactionUtil.deleteById(id);

    // 6. Xử lý Logic Cập nhật Listing
    // Nếu tin đăng đã bị BÁN (do người khác nhanh tay hơn)
    if (currentListingStatus === 'Sold') {
      return res.json({
        success: true,
        message: 'Đã hủy đơn hàng. Tin đăng này đã được bán cho người khác.'
      });
    }

    // Nếu tin đăng CHƯA BÁN, cập nhật lại status (ví dụ: 'Active' hoặc 'Available')
    // Giả sử Listing Model dùng 'Active'
    try {
      await axios.put(
        `${listingServiceUrl}/${listingId}/status`,
        { status: 'Active' }, // Trả lại trạng thái Active
        { headers: { Authorization: token } }
      );

      console.log(`[TransactionService] Hủy đơn hàng ${id}, đã cập nhật Listing ${listingId} về 'Active'.`);

      return res.json({
        success: true,
        message: 'Đã hủy đơn hàng thành công và cập nhật lại tin đăng.'
      });

    } catch (listingError) {
      console.error(`[TransactionService] Hủy đơn hàng ${id} thành công, nhưng FAILED khi cập nhật Listing ${listingId} về 'Active'.`);
      console.error(listingError.message);
      return res.json({
        success: true,
        message: 'Đã hủy đơn hàng (nhưng có lỗi khi cập nhật lại tin đăng).'
      });
    }

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


module.exports = {
  createOrder,
  processPayment,
  generateContract,
  getOrderHistory,
  cancelPendingOrder,
};