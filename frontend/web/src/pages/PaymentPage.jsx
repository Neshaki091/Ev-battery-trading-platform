import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PaymentStatus from '../components/PaymentStatus';
import '../css/PaymentPage.css';

// Icon components
const IconCopy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconBank = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="21" x2="21" y2="21"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <line x1="5" y1="6" x2="5" y2="21"></line>
    <line x1="19" y1="6" x2="19" y2="21"></line>
    <line x1="9" y1="6" x2="9" y2="21"></line>
    <line x1="15" y1="6" x2="15" y2="21"></line>
    <polyline points="1.5 10 12 3 22.5 10"></polyline>
  </svg>
);

function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState({});
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Thông tin ngân hàng (có thể cấu hình qua env, mặc định khớp với tài khoản Casso)
  const bankInfo = {
    bankName: import.meta.env.VITE_BANK_NAME || 'ACB Official',
    bankCode: import.meta.env.VITE_BANK_CODE || 'ACB',
    accountNumber: import.meta.env.VITE_BANK_ACCOUNT || '22729081',
    accountName: import.meta.env.VITE_BANK_ACCOUNT_NAME || 'EVB-TRADING-COMPANY',
    branch: import.meta.env.VITE_BANK_BRANCH || 'Không yêu cầu chi nhánh'
  };

  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng');
      setLoading(false);
      return;
    }

    fetchOrderDetails();
    // Tự động kiểm tra trạng thái thanh toán mỗi 5 giây
    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/transactions/orders/history`);
      const orders = response.data?.data || response.data || [];
      const foundOrder = orders.find(o => o._id === orderId || o.id === orderId);
      
      if (!foundOrder) {
        setError('Không tìm thấy đơn hàng');
        return;
      }

      setOrder(foundOrder);
      
      // Nếu đã thanh toán, chuyển về cart
      if (foundOrder.status === 'paid' || foundOrder.status === 'completed') {
        setTimeout(() => {
          navigate('/cart');
        }, 2000);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!orderId || checkingPayment) return;
    
    try {
      setCheckingPayment(true);
      const response = await api.get(`/transactions/orders/history`);
      const orders = response.data?.data || response.data || [];
      const foundOrder = orders.find(o => o._id === orderId || o.id === orderId);
      
      if (foundOrder && (foundOrder.status === 'paid' || foundOrder.status === 'completed')) {
        setOrder(foundOrder);
        setTimeout(() => {
          navigate('/cart');
        }, 2000);
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    } finally {
      setCheckingPayment(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [field]: true });
      setTimeout(() => {
        setCopied({ ...copied, [field]: false });
      }, 2000);
    });
  };

  const getTransferContent = () => {
    return `ORDER#${orderId}`;
  };

  const getVietQRUrl = () => {
    if (!order || !order.price) return null;

    const bankId = import.meta.env.VITE_VIETQR_BANK_ID || bankInfo.bankCode || 'ACB';
    const template = import.meta.env.VITE_VIETQR_TEMPLATE || 'compact2';

    const amount = Number(order.price);
    if (!Number.isFinite(amount) || amount <= 0) return null;

    let sanitizedName = bankInfo.accountName || '';
    sanitizedName = sanitizedName.replace(/[^A-Za-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

    const baseUrl = 'https://img.vietqr.io/image';
    const queryParts = [];

    queryParts.push(`amount=${encodeURIComponent(Math.round(amount).toString())}`);
    queryParts.push(`addInfo=${encodeURIComponent(getTransferContent())}`);

    if (sanitizedName) {
      queryParts.push(`accountName=${encodeURIComponent(sanitizedName)}`);
    }

    const query = queryParts.join('&');

    return `${baseUrl}/${encodeURIComponent(bankId)}-${encodeURIComponent(
      bankInfo.accountNumber
    )}-${encodeURIComponent(template)}.png?${query}`;
  };

  const vietQRUrl = getVietQRUrl();

  if (loading) {
    return (
      <div className="payment-page">
        <div className="container py-8">
          <div className="payment-loading">Đang tải thông tin đơn hàng...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="container py-8">
          <div className="payment-error">
            <h2>Lỗi</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/cart')} className="btn btn-primary">
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container py-8">
        <div className="payment-header">
          <h1>Thanh toán đơn hàng</h1>
          <p className="payment-subtitle">
            Vui lòng chuyển khoản theo thông tin bên dưới để hoàn tất đơn hàng
          </p>
        </div>

        <div className="payment-grid">
          {/* Cột trái: Thông tin đơn hàng */}
          <div className="payment-order-info">
            <div className="card">
              <h2 className="card-title">Thông tin đơn hàng</h2>
              <div className="order-details">
                <div className="order-detail-row">
                  <span className="label">Mã đơn hàng:</span>
                  <span className="value">{orderId}</span>
                </div>
                <div className="order-detail-row">
                  <span className="label">Loại sản phẩm:</span>
                  <span className="value">{order?.type === 'xe' ? 'Xe điện' : 'Pin'}</span>
                </div>
                <div className="order-detail-row">
                  <span className="label">Trạng thái:</span>
                  <span className={`status-badge status-${order?.status}`}>
                    {order?.status === 'pending' ? 'Chờ thanh toán' :
                     order?.status === 'paid' ? 'Đã thanh toán' :
                     order?.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                  </span>
                </div>
                <div className="order-detail-row total">
                  <span className="label">Tổng tiền:</span>
                  <span className="value price">{order?.price?.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {order?.status === 'paid' && (
                <div className="payment-success-notice">
                  <IconCheck />
                  <div>
                    <strong>Đã thanh toán thành công!</strong>
                    <p>Đang chuyển hướng về giỏ hàng...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Component theo dõi trạng thái thanh toán */}
            <div style={{ marginTop: '1.5rem' }}>
              <PaymentStatus
                orderId={orderId}
                onPaymentSuccess={(result) => {
                  console.log('Payment success:', result);
                  setTimeout(() => {
                    navigate('/cart');
                  }, 2000);
                }}
                pollInterval={5000}
              />
            </div>
          </div>

          {/* Cột phải: Thông tin chuyển khoản */}
          <div className="payment-bank-info">
            <div className="card bank-card">
              <div className="bank-header">
                <IconBank />
                <h2>Thông tin chuyển khoản</h2>
              </div>

              <div className="bank-details">
                <div className="bank-detail-item">
                  <label>Ngân hàng</label>
                  <div className="bank-value">
                    <span>{bankInfo.bankName} ({bankInfo.bankCode})</span>
                  </div>
                </div>

                <div className="bank-detail-item">
                  <label>Chi nhánh</label>
                  <div className="bank-value">
                    <span>{bankInfo.branch}</span>
                  </div>
                </div>

                <div className="bank-detail-item">
                  <label>Số tài khoản</label>
                  <div className="bank-value copyable">
                    <span className="account-number">{bankInfo.accountNumber}</span>
                    <button
                      onClick={() => copyToClipboard(bankInfo.accountNumber, 'accountNumber')}
                      className="copy-btn"
                      title="Sao chép"
                    >
                      {copied.accountNumber ? <IconCheck /> : <IconCopy />}
                    </button>
                  </div>
                </div>

                <div className="bank-detail-item">
                  <label>Chủ tài khoản</label>
                  <div className="bank-value">
                    <span>{bankInfo.accountName}</span>
                  </div>
                </div>

                <div className="bank-detail-item highlight">
                  <label>Số tiền</label>
                  <div className="bank-value copyable">
                    <span className="amount">{order?.price?.toLocaleString('vi-VN')} đ</span>
                    <button
                      onClick={() => copyToClipboard(order?.price?.toString(), 'amount')}
                      className="copy-btn"
                      title="Sao chép"
                    >
                      {copied.amount ? <IconCheck /> : <IconCopy />}
                    </button>
                  </div>
                </div>

                <div className="bank-detail-item highlight">
                  <label>Nội dung chuyển khoản</label>
                  <div className="bank-value copyable">
                    <span className="transfer-content">{getTransferContent()}</span>
                    <button
                      onClick={() => copyToClipboard(getTransferContent(), 'content')}
                      className="copy-btn"
                      title="Sao chép"
                    >
                      {copied.content ? <IconCheck /> : <IconCopy />}
                    </button>
                  </div>
                  <p className="help-text">
                    ⚠️ Vui lòng nhập chính xác nội dung này để hệ thống tự động xác nhận thanh toán
                  </p>
                </div>
              </div>

              {vietQRUrl && (
                <div className="payment-qr">
                  <h3>Quét mã QR để thanh toán nhanh</h3>
                  <img src={vietQRUrl} alt="Mã QR thanh toán VietQR" />
                  <p className="help-text">
                    Khi quét mã, số tiền và nội dung <strong>{getTransferContent()}</strong> sẽ được điền sẵn.
                  </p>
                </div>
              )}

              <div className="payment-instructions">
                <h3>Hướng dẫn thanh toán</h3>
                <ol>
                  <li>Mở ứng dụng ngân hàng của bạn</li>
                  <li>Chọn chức năng chuyển khoản</li>
                  <li>Nhập thông tin tài khoản nhận ở trên</li>
                  <li>Nhập số tiền: <strong>{order?.price?.toLocaleString('vi-VN')} đ</strong></li>
                  <li>Nhập nội dung: <strong>{getTransferContent()}</strong></li>
                  <li>Xác nhận và hoàn tất giao dịch</li>
                  <li>Hệ thống sẽ tự động cập nhật trạng thái đơn hàng trong vài phút</li>
                </ol>
              </div>

              <div className="payment-actions">
                <button
                  onClick={checkPaymentStatus}
                  className="btn btn-secondary"
                  disabled={checkingPayment}
                >
                  {checkingPayment ? 'Đang kiểm tra...' : 'Kiểm tra thanh toán'}
                </button>
                <button onClick={() => navigate('/cart')} className="btn btn-ghost">
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;

