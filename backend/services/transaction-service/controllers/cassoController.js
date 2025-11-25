const transactionService = require('../services/transactionService');
const { publishEvent } = require('../utils/mqService');
const axios = require('axios');

const extractOrderId = (payload) => {
  const description = payload.description || payload.content || payload.memo || '';
  const match =
    description.match(/ORDER#([a-f0-9]{24})/i) || description.match(/order[:\s]*([a-f0-9]{24})/i);
  return match ? match[1] : undefined;
};

const isCassoDashboardTest = (body) => {
  if (!body) return false;

  const data = body.data;
  const record = Array.isArray(data) ? data[0] : data;
  if (!record) return false;

  const reference = record.reference || record.tid || '';
  const description = record.description || record.content || record.memo || '';

  return reference === 'MA_GIAO_DICH_THU_NGHIEM' || /giao dich thu nghiem/i.test(description);
};

const handleWebhook = async (req, res) => {
  try {
    // Kiểm tra nếu là test request ping từ Casso (không có data hoặc data rỗng)
    const isPingTest =
      !req.body?.data || (Array.isArray(req.body?.data) && req.body.data.length === 0);

    if (isPingTest) {
      console.log('📝 Nhận test request (ping) từ Casso - Webhook đã được cấu hình thành công!');
      return res.status(200).json({
        success: true,
        message: 'Webhook endpoint is ready',
        timestamp: new Date().toISOString()
      });
    }

    // Nhận biết request "Gọi thử" từ giao diện Casso (payload mẫu MA_GIAO_DICH_THU_NGHIEM)
    if (isCassoDashboardTest(req.body)) {
      console.log('🧪 Nhận request Gọi thử từ Casso - chỉ trả 200 OK.');
      return res.status(200).json({
        success: true,
        test: true,
        message: 'Received Casso test webhook successfully (no order processed).',
        timestamp: new Date().toISOString()
      });
    }

    const data = req.body?.data;
    const records = Array.isArray(data) ? data : data ? [data] : [];
    const results = [];

    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        data: [],
        error: 'Payload không chứa danh sách giao dịch hợp lệ'
      });
    }

    for (const record of records) {
      if (!record) continue;

      const orderId = extractOrderId(record);

      if (!orderId) {
        results.push({
          success: false,
          reason: 'Không tìm thấy mã order trong nội dung chuyển khoản',
          record
        });
        continue;
      }

      try {
        const payment = {
          transId: record.id || record.trans_id || record.reference_number || record.tid,
          description: record.description || record.content || record.memo,
          amount: Number(record.amount || record.transfer_amount || 0),
          bankCode: record.bank_short_name || record.bank_code,
          paidAt: record.when || record.transaction_date || record.transactionDateTime,
          raw: record
        };

        const transaction = await transactionService.markTransactionPaidFromCasso({
          orderId,
          payment
        });

        // 🆕 Publish event to RabbitMQ for analytics
        try {
          await publishEvent('transaction_paid', {
            transactionId: transaction._id,
            orderId: transaction._id,
            userId: transaction.userId,
            sellerId: transaction.sellerId,
            listingId: transaction.listingId,
            amount: transaction.price,
            price: transaction.price,
            commissionAmount: transaction.commissionAmount,
            status: 'paid',
            paidAt: transaction.paidAt,
            paymentMethod: 'casso',
            type: transaction.type,
            cassoPayment: transaction.cassoPayment
          });
          console.log(`[MQ] Published transaction_paid event for Casso order ${orderId}`);
        } catch (mqError) {
          console.error('Error publishing transaction_paid event from Casso:', mqError.message);
        }

        // 🆕 CẬP NHẬT LISTING SANG 'SOLD' (giống thanh toán thủ công)
        try {
          const listingId = transaction.listingId;
          const listingServiceUrl = process.env.LISTING_SERVICE_URL || 'http://backend-listing-service-1:5000';

          console.log(`[CassoWebhook] Thanh toán Casso ${orderId} thành công. Bắt đầu cập nhật Listing ${listingId} sang 'Sold'...`);

          await axios.put(
            `${listingServiceUrl}/${listingId}/status`,
            { status: 'Sold' },
            {
              headers: {
                'x-internal-key': process.env.INTERNAL_API_KEY
              }
            }
          );

          console.log(`[CassoWebhook] ✅ Đã cập nhật Listing ${listingId} thành 'Sold' thành công.`);
        } catch (listingError) {
          console.error(`[CassoWebhook] ⚠️ LỖI: Thanh toán Casso ${orderId} THÀNH CÔNG, nhưng FAILED khi cập nhật status cho Listing ${transaction.listingId}.`);
          console.error(listingError.message);
          // Không throw error vì thanh toán đã thành công
        }

        // 🆕 CỘNG TIỀN VÀO VÍ SELLER
        try {
          const sellerAmount = transaction.price - (transaction.commissionAmount || 0);
          const userServiceUrl = process.env.USER_SERVICE_URL || 'http://backend-auth-service-1:3000';

          console.log(`[CassoWebhook] Bắt đầu cộng ${sellerAmount} đ vào ví seller ${transaction.sellerId}...`);

          await axios.post(
            `${userServiceUrl}/wallet/add`,
            {
              userId: transaction.sellerId.toString(),
              amount: sellerAmount
            },
            {
              headers: {
                'x-internal-key': process.env.INTERNAL_API_KEY || 'your-secret-internal-key'
              }
            }
          );

          console.log(`✅ [CassoWebhook] Đã cộng ${sellerAmount.toLocaleString('vi-VN')} đ vào ví seller ${transaction.sellerId}`);
        } catch (walletError) {
          console.error(`⚠️ [CassoWebhook] LỖI khi cộng tiền vào ví seller ${transaction.sellerId}:`, walletError.response?.data || walletError.message);
        }

        results.push({ success: true, orderId, transactionId: transaction._id });
      } catch (error) {
        results.push({ success: false, orderId, error: error.message, record });
      }
    }

    const hasSuccess = results.some((item) => item.success);

    return res.status(hasSuccess ? 200 : 400).json({
      success: hasSuccess,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  handleWebhook
};
