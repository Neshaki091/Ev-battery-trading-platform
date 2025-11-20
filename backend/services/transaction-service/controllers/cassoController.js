const crypto = require('crypto');
const transactionService = require('../services/transactionService');

const getSignatureFromHeaders = (headers) =>
  headers['x-casso-signature'] || headers['x-signature'] || headers['x-casso-token'];

/**
 * Parse Casso's X-Casso-Signature header.
 * Example format: "t=1727948258788,v1=ed0a4b..."
 */
const parseCassoSignatureHeader = (headerValue) => {
  if (!headerValue || typeof headerValue !== 'string') return { timestamp: null, digest: null };

  const value = headerValue.trim();

  // New format: "t=...,v1=..."
  if (value.includes('v1=')) {
    const parts = value.split(',');
    const kv = {};

    for (const part of parts) {
      const [k, v] = part.split('=');
      if (k && v) {
        kv[k.trim()] = v.trim();
      }
    }

    return {
      timestamp: kv.t || null,
      digest: kv.v1 || null
    };
  }

  // Legacy format: header is just the hex digest
  return { timestamp: null, digest: value };
};

const verifySignature = (rawBody, signatureHeader, secret) => {
  if (!secret) {
    throw new Error('Thiếu biến môi trường CASSO_WEBHOOK_SECRET');
  }

  if (!signatureHeader) {
    return false;
  }

  const { timestamp, digest: receivedDigest } = parseCassoSignatureHeader(signatureHeader);

  if (!receivedDigest) {
    return false;
  }

  // Đảm bảo chữ ký có dạng hex hợp lệ
  if (!/^[a-f0-9]+$/i.test(receivedDigest)) {
    console.error('❌ Định dạng chữ ký Casso không hợp lệ:', receivedDigest);
    return false;
  }

  const received = Buffer.from(receivedDigest, 'hex');

  // Chọn thuật toán HMAC dựa theo độ dài chữ ký Casso gửi
  // - 64 ký tự hex  (32 bytes)  → HMAC-SHA256 (format cũ: script test, Postman)
  // - 128 ký tự hex (64 bytes)  → HMAC-SHA512 (Casso Webhook V2)
  const algo = received.length === 64 ? 'sha512' : 'sha256';

  // Các chuỗi có thể Casso dùng để ký (hỗ trợ cả định dạng cũ và mới)
  const candidateMessages = new Set();
  candidateMessages.add(rawBody);
  if (timestamp) {
    candidateMessages.add(`${timestamp}.${rawBody}`);
    candidateMessages.add(`${rawBody}.${timestamp}`);
    candidateMessages.add(`${timestamp}${rawBody}`);
    candidateMessages.add(`${rawBody}${timestamp}`);
  }

  for (const message of candidateMessages) {
    const computed = crypto
      .createHmac(algo, secret)
      .update(message)
      .digest('hex');

    const expected = Buffer.from(computed, 'hex');
    if (expected.length === received.length && crypto.timingSafeEqual(expected, received)) {
      return true;
    }
  }

  return false;
};

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
    const rawBody = req.rawBody || JSON.stringify(req.body || {});
    const signature = getSignatureFromHeaders(req.headers);

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
    // Trường hợp này CHỈ là test kết nối, không cập nhật đơn hàng, nên có thể bỏ qua verify chữ ký
    if (isCassoDashboardTest(req.body)) {
      console.log(
        '🧪 Nhận request Gọi thử từ Casso - bỏ qua verify chữ ký và xử lý đơn hàng, chỉ trả 200 OK.'
      );
      return res.status(200).json({
        success: true,
        test: true,
        message: 'Received Casso test webhook successfully (no order processed).',
        timestamp: new Date().toISOString()
      });
    }

    // Verify signature cho các request còn lại (giao dịch thật)
    if (!verifySignature(rawBody, signature, process.env.CASSO_WEBHOOK_SECRET)) {
      console.error('❌ Chữ ký không hợp lệ:', { signature, rawBody: rawBody.substring(0, 100) });
      return res.status(401).json({ success: false, error: 'Chữ ký không hợp lệ' });
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

