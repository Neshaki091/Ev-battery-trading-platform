import { useEffect, useState } from 'react';
import { checkPaymentStatus } from '../services/payment';
import '../css/PaymentStatus.css';

// Icon components
const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const IconRefresh = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

/**
 * Component theo dõi trạng thái thanh toán
 * @param {string} orderId - ID của đơn hàng
 * @param {function} onPaymentSuccess - Callback khi thanh toán thành công
 * @param {number} pollInterval - Khoảng thời gian kiểm tra (ms), mặc định 5000ms
 */
function PaymentStatus({ orderId, onPaymentSuccess, pollInterval = 5000 }) {
  const [status, setStatus] = useState({
    isPaid: false,
    status: 'pending',
    cassoPayment: null,
    paidAt: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    // Kiểm tra ngay lập tức
    checkStatus();

    // Thiết lập interval để kiểm tra định kỳ
    const interval = setInterval(() => {
      checkStatus();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [orderId, pollInterval]);

  const checkStatus = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      const result = await checkPaymentStatus(orderId);
      setStatus(result);
      setLastChecked(new Date());

      // Gọi callback nếu thanh toán thành công
      if (result.isPaid && onPaymentSuccess) {
        onPaymentSuccess(result);
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <div className={`payment-status payment-status--${status.isPaid ? 'paid' : 'pending'}`}>
      <div className="payment-status-header">
        <div className="payment-status-icon">
          {status.isPaid ? <IconCheckCircle /> : <IconClock />}
        </div>
        <div className="payment-status-info">
          <h3 className="payment-status-title">
            {status.isPaid ? 'Đã thanh toán' : 'Chờ thanh toán'}
          </h3>
          <p className="payment-status-subtitle">
            {status.isPaid 
              ? `Thanh toán thành công lúc ${formatTime(status.paidAt)}`
              : 'Hệ thống đang theo dõi giao dịch của bạn'}
          </p>
        </div>
        <button 
          onClick={checkStatus} 
          className="payment-status-refresh"
          disabled={loading}
          title="Kiểm tra lại"
        >
          <IconRefresh className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {status.cassoPayment && (
        <div className="payment-status-details">
          <h4>Thông tin thanh toán từ Casso</h4>
          <div className="payment-detail-grid">
            <div className="payment-detail-item">
              <span className="label">Mã giao dịch:</span>
              <span className="value">{status.cassoPayment.transId}</span>
            </div>
            <div className="payment-detail-item">
              <span className="label">Số tiền:</span>
              <span className="value">{status.cassoPayment.amount?.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="payment-detail-item">
              <span className="label">Ngân hàng:</span>
              <span className="value">{status.cassoPayment.bankCode}</span>
            </div>
            <div className="payment-detail-item">
              <span className="label">Nội dung:</span>
              <span className="value">{status.cassoPayment.description}</span>
            </div>
          </div>
        </div>
      )}

      {lastChecked && (
        <div className="payment-status-footer">
          <small>Kiểm tra lần cuối: {formatTime(lastChecked)}</small>
        </div>
      )}

      {error && (
        <div className="payment-status-error">
          <p>⚠️ Lỗi khi kiểm tra trạng thái: {error}</p>
        </div>
      )}
    </div>
  );
}

export default PaymentStatus;

