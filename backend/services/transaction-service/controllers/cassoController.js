const crypto = require('crypto');
const transactionService = require('../services/transactionService');

const getSignatureFromHeaders = (headers) =>
  headers['x-casso-signature'] || headers['x-signature'] || headers['x-casso-token'];

const verifySignature = (rawBody, signature, secret) => {
  if (!secret) {
    throw new Error('Thiếu biến môi trường CASSO_WEBHOOK_SECRET');
  }

  if (!signature) {
    return false;
  }

  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const expected = Buffer.from(computed);
  const received = Buffer.from(signature);

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
};

const extractOrderId = (payload) => {
  const description = payload.description || payload.content || payload.memo || '';
  const match = description.match(/ORDER#([a-f0-9]{24})/i) || description.match(/order[:\s]*([a-f0-9]{24})/i);
  return match ? match[1] : undefined;
};

const handleWebhook = async (req, res) => {
  try {
    const rawBody = req.rawBody || JSON.stringify(req.body || {});
    const signature = getSignatureFromHeaders(req.headers);

    if (!verifySignature(rawBody, signature, process.env.CASSO_WEBHOOK_SECRET)) {
      return res.status(401).json({ success: false, error: 'Chữ ký không hợp lệ' });
    }

    const records = Array.isArray(req.body?.data) ? req.body.data : [req.body];
    const results = [];

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
          transId: record.id || record.trans_id || record.reference_number,
          description: record.description || record.content || record.memo,
          amount: Number(record.amount || record.transfer_amount || 0),
          bankCode: record.bank_short_name || record.bank_code,
          paidAt: record.when || record.transaction_date,
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

    res.status(hasSuccess ? 200 : 400).json({
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

