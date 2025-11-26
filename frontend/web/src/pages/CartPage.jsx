import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

// === ICONS (Giữ nguyên) ===
const IconImagePlaceholder = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconEmptyBox = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </svg>
);
const IconCreditCard = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
);
const IconDownload = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

const IconView = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

// === KẾT THÚC ICONS ===


// === MỚI: MODAL HIỂN THỊ CHI TIẾT ===
const TransactionDetailModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  // Lấy dữ liệu chi tiết từ item
  const { order, listing } = transaction.details || {};

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  };

  const contentStyle = {
    background: 'white',
    padding: '2rem',
    borderRadius: 'var(--radius-lg)',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
    color: 'var(--text-body)',
    position: 'relative' // Để định vị nút close
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'var(--text-body)',
    lineHeight: '1'
  };

  return (
    // Lớp phủ modal
    <div style={modalStyle} onClick={onClose}>
      {/* Nội dung modal */}
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>
          Chi tiết giao dịch
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Thông tin cơ bản */}
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
            <h3 className="text-lg font-semibold mb-2">Sản phẩm: {transaction.name}</h3>
            <p><strong>Trạng thái:</strong> <StatusBadge status={transaction.status} /></p>
            <p><strong>Giá:</strong> {transaction.price?.toLocaleString('vi-VN')} VND</p>
          </div>

          {/* Chi tiết từ Order */}
          {order && (
            <div className="p-4 rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
              <h4 className="text-lg font-semibold mb-2">Chi tiết đơn hàng</h4>
              <p><strong>ID Giao dịch:</strong> {order._id || order.id}</p>
              <p><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
              <p><strong>Loại:</strong> {order.type || 'Không rõ'}</p>
              {/* Thêm các trường khác của order nếu có */}
            </div>
          )}

          {/* Chi tiết từ Listing */}
          {listing && (
            <div className="p-4 rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
              <h4 className="text-lg font-semibold mb-2">Chi tiết sản phẩm</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>
                <strong>Mô tả:</strong> {listing.description || 'Không có mô tả'}
              </p>
              <p><strong>Tình trạng:</strong> {listing.condition || 'Không rõ'}</p>
              <p><strong>Địa điểm:</strong> {listing.location || 'Không rõ'}</p>
            </div>
          )}

          {!order && !listing && (
            <p>Không có thông tin chi tiết bổ sung.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Hàm helper để tạo Status Badge (Đưa ra ngoài để Modal có thể dùng)
const StatusBadge = ({ status }) => {
  const isPending = status === 'pending';
  const style = {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    background: isPending ? 'var(--color-danger-light)' : 'var(--bg-muted)',
    color: isPending ? 'var(--color-danger)' : 'var(--text-body)',
  };
  return <span style={style}>{status || 'pending'}</span>;
};


function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === MỚI: State để quản lý modal ===
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // === CẬP NHẬT: useEffect ===
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/transactions/orders/history');
        const orders = response.data?.data || response.data || [];

        // Lấy current user để biết mình là buyer hay seller trong từng giao dịch
        let currentUserId = null;
        try {
          const userDataString = localStorage.getItem('evb_user');
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            currentUserId = userData._id || userData.user_id;
          }
        } catch (parseErr) {
          console.warn('Không thể đọc evb_user từ localStorage:', parseErr);
        }

        if (orders.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const listingIds = [...new Set(orders.map(order => order.listingId))];
        const listingPromises = listingIds.map(id =>
          api.get(`/listings/${id}`).catch(err => null)
        );
        const listingResponses = await Promise.all(listingPromises);

        const listingsMap = {};
        listingResponses.forEach(res => {
          if (res && res.data) {
            const listingData = res.data.data || res.data;
            listingsMap[listingData._id] = listingData;
          }
        });

        // === CẬP NHẬT: Lưu trữ chi tiết đầy đủ ===
        const items = orders.map(order => {
          const listingDetail = listingsMap[order.listingId];

          // Xác định role của user trong giao dịch này
          const rawBuyerId =
            order.userId?._id || order.userId?.id || order.userId?.user_id || order.userId || order.buyerId;
          const rawSellerId =
            order.sellerId?._id || order.sellerId?.id || order.sellerId?.user_id || order.sellerId;

          const buyerIdStr = rawBuyerId ? String(rawBuyerId) : null;
          const sellerIdStr = rawSellerId ? String(rawSellerId) : null;
          const currentIdStr = currentUserId ? String(currentUserId) : null;

          let role = 'unknown';
          if (currentIdStr && sellerIdStr && currentIdStr === sellerIdStr) {
            role = 'seller';
          } else if (currentIdStr && buyerIdStr && currentIdStr === buyerIdStr) {
            role = 'buyer';
          }

          const buyerSignedAt = order.buyerSignature && order.buyerSignature.signedAt;
          const sellerSignedAt = order.sellerSignature && order.sellerSignature.signedAt;

          return {
            // Dữ liệu tóm tắt cho danh sách
            id: order._id || order.id,
            name: listingDetail?.title || 'Tin đăng đã bị xóa',
            price: order.price || 0,
            quantity: 1,
            image: listingDetail?.images?.[0] || null,
            status: order.status,
            role,
            buyerId: rawBuyerId || null,
            sellerId: rawSellerId || null,
            buyerSigned: !!buyerSignedAt,
            sellerSigned: !!sellerSignedAt,
            // Dữ liệu chi tiết cho modal
            details: {
              order: order,
              listing: listingDetail
            }
          };
        });
        setCartItems(items);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // === Các hàm xử lý ===
  const handleRemoveItem = async (itemId) => {
    alert('Giao dịch không thể xóa. Vui lòng liên hệ admin nếu cần hủy.');
  };

  const handlePayOrder = async (orderId) => {
    try {
      // Thanh toán bằng ví nội bộ (Transaction Service sẽ trừ tiền từ ví buyer)
      await api.post(`/transactions/orders/${orderId}/payment/`);
      alert('Thanh toán bằng ví thành công');
      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === orderId ? { ...item, status: 'paid' } : item
        )
      );
    } catch (err) {
      console.error('Error paying order object:', err);
      const errorMessage =
        err.response?.data?.error || err.response?.data?.message || err.message;
      if (err.response?.data?.requiresProfileUpdate) {
        const shouldUpdate = window.confirm(
          'Bạn phải cập nhật đầy đủ Họ và Tên trước khi thanh toán.\n\nBạn có muốn chuyển đến trang Profile để cập nhật ngay bây giờ?'
        );
        if (shouldUpdate) {
          navigate('/profile');
        }
      } else {
        alert('Không thể thanh toán bằng ví: ' + errorMessage);
      }
    }
  };

  const handleDownloadContract = async (orderId) => {
    try {
      const response = await api.get(`/transactions/orders/${orderId}/contract/`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contract_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      alert('Đang tải hợp đồng...');
    } catch (err) {
      console.error('Error downloading contract:', err);
      let errorMessage = err.message;
      if (err.response && err.response.data instanceof Blob) {
        try {
          const errorText = await err.response.data.text();
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || err.message;
        } catch (parseError) {
          errorMessage = 'Lỗi không xác định khi tải hợp đồng.';
        }
      } else {
        errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      }
      alert('Không thể tải hợp đồng: ' + errorMessage);
    }
  };

  // 🆕 Seller: Hủy giao dịch (chỉ khi pending)
  const handleSellerCancel = async (item) => {
    if (!item || item.role !== 'seller') return;

    const confirmCancel = window.confirm(
      'Bạn có chắc chắn muốn hủy giao dịch này? Khách hàng sẽ không thể tiếp tục thanh toán.'
    );
    if (!confirmCancel) return;

    const reason = window.prompt('Lý do hủy (tùy chọn):', 'Sản phẩm không còn khả dụng');

    try {
      // Backend route: POST /transactions/:id/cancel (qua gateway: /api/transactions/transactions/:id/cancel)
      await api.post(`/transactions/transactions/${item.id}/cancel`, {
        reason: reason || 'Seller cancelled transaction from history',
      });

      alert('Đã hủy giao dịch thành công.');
      setCartItems((currentItems) =>
        currentItems.map((it) =>
          it.id === item.id ? { ...it, status: 'cancelled' } : it
        )
      );
    } catch (err) {
      console.error('Error cancelling transaction:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Không thể hủy giao dịch';
      alert(errorMessage);
    }
  };

  // 🆕 Nhắn tin với khách hàng / người bán trong giao dịch
  const handleOpenChatInTransaction = async (item) => {
    try {
      if (!item) return;

      const order = item.details?.order || {};
      const buyerId =
        order.userId?._id || order.userId?.id || order.userId?.user_id || order.userId || item.buyerId;
      const sellerId =
        order.sellerId?._id || order.sellerId?.id || order.sellerId?.user_id || order.sellerId || item.sellerId;

      const receiverId = item.role === 'seller' ? buyerId : sellerId;

      if (!receiverId) {
        alert('Không tìm thấy thông tin người dùng để nhắn tin.');
        return;
      }

      const response = await api.post('/chat/rooms', { receiverId });
      const roomData = response.data || response;
      const roomId =
        roomData?.roomId ||
        roomData?.data?.roomId ||
        roomData?._id ||
        roomData?.id;

      if (!roomId) {
        throw new Error('Không thể tạo hoặc lấy phòng chat.');
      }

      navigate(`/chat/${roomId}`);
    } catch (err) {
      console.error('Error creating/getting chat room from transaction:', err);
      alert(
        err.response?.data?.message ||
          err.message ||
          'Lỗi khi tạo cuộc trò chuyện với khách hàng.'
      );
    }
  };

  // 🆕 Ký hợp đồng điện tử (buyer hoặc seller)
  const handleSignContract = async (item) => {
    if (!item) return;

    try {
      // Backend route: POST /transactions/:id/sign (qua gateway: /api/transactions/transactions/:id/sign)
      const response = await api.post(`/transactions/transactions/${item.id}/sign`, {
        deviceInfo: navigator.userAgent || 'web',
      });

      const data = response.data?.data || response.data || {};
      const buyerSigned =
        data.buyerSignature && (data.buyerSignature.signedAt || data.buyerSignature.signed);
      const sellerSigned =
        data.sellerSignature && (data.sellerSignature.signedAt || data.sellerSignature.signed);

      setCartItems((currentItems) =>
        currentItems.map((it) =>
          it.id === item.id
            ? {
                ...it,
                buyerSigned: !!buyerSigned,
                sellerSigned: !!sellerSigned,
              }
            : it
        )
      );

      alert('Đã ký hợp đồng điện tử thành công.');
    } catch (err) {
      console.error('Error signing contract:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Không thể ký hợp đồng';
      alert(errorMessage);
    }
  };

  // === Các hàm tính tổng (Giữ nguyên) ===
  const calculateTotal = () => {
    // Chỉ tính tổng cho các giao dịch mà mình là người mua
    const pendingItems = cartItems.filter(
      item => item.status === 'pending' && item.role === 'buyer'
    );
    return pendingItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateTotalPaid = () => {
    // Chỉ tính tổng đã mua cho các giao dịch mà mình là người mua
    const paidItems = cartItems.filter(
      item => item.status === 'paid' && item.role === 'buyer'
    );
    return paidItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // === Trạng thái Loading (Giữ nguyên) ===
  if (loading) {
    return (
      <div className="loading-container text-center py-20">
        <div className="loading-spinner-simple"></div>
        <p className="text-xl mt-4" style={{ color: 'var(--text-body)' }}>
          Đang tải lịch sử giao dịch...
        </p>
      </div>
    );
  }

  // === Trạng thái Error (Giữ nguyên) ===
  if (error) {
    return (
      <div className="error-container text-center py-20">
        <h3 className="text-xl font-semibold" style={{ color: 'var(--color-danger)' }}>
          Lỗi: {error}
        </h3>
        <p className="mt-2" style={{ color: 'var(--text-body)' }}>
          Không thể tải dữ liệu. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  // === JSX Trả về (Đã cập nhật) ===
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>

      {/* === MỚI: Hiển thị Modal === */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-heading)' }}>
          Lịch sử giao dịch
        </h1>

        {cartItems.length === 0 ? (
          // === Trạng thái Empty (Giữ nguyên) ===
          <div className="card text-center py-20">
            <div style={{ color: '#9ca3af', margin: '0 auto', fontSize: '3rem' }}>
              <IconEmptyBox />
            </div>
            <p className="text-xl text-gray-600 my-4">Bạn chưa có giao dịch nào</p>
            <Link to="/" className="btn btn-primary">
              Bắt đầu mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-1 grid-lg-3" style={{ gap: '2rem' }}>

            {/* CỘT TRÁI: DANH SÁCH GIAO DỊCH (ĐÃ CẬP NHẬT) */}
            <div style={{ gridColumn: 'span 2' }}>
              <div className="card">
                {cartItems.map((item) => {
                  const listingId = item.details?.listing?._id;
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col md:flex-row items-center gap-4 p-4"
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      {/* Hình ảnh */}
                      <div
                        className="flex-shrink-0"
                        style={{
                          width: '96px',
                          height: '96px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedTransaction(item)}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ color: 'var(--text-body)' }}>
                            <IconImagePlaceholder />
                          </div>
                        )}
                      </div>

                      {/* Thông tin chính */}
                      <div
                        style={{ flex: 1, textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => setSelectedTransaction(item)}
                      >
                        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-heading)' }}>
                          {item.name}
                        </h3>
                        <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                          {item.price ? `${item.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                        </p>
                        <div className="mt-1">
                          <StatusBadge status={item.status} />
                        </div>
                      </div>

                      {/* Cột bên phải: nút hành động */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        {/* Buyer actions: thanh toán + ký hợp đồng + tải hợp đồng */}
                        {item.role === 'buyer' && item.status === 'pending' && (
                          <>
                            <Link
                              to={`/payment/${item.id}`}
                              className="btn btn-primary flex items-center justify-center gap-2"
                              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                            >
                              <IconCreditCard />
                              Thanh toán qua Casso
                            </Link>
                            <button
                              onClick={() => handlePayOrder(item.id)}
                              className="btn btn-ghost flex items-center justify-center gap-2"
                              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                              title="Thanh toán thủ công (không qua Casso)"
                            >
                              <IconCreditCard />
                              Thanh toán thủ công
                            </button>
                          </>
                        )}

                        {item.role === 'buyer' && (item.status === 'paid' || item.status === 'completed') && (
                          <button
                            onClick={() => handleDownloadContract(item.id)}
                            className="btn btn-secondary flex items-center justify-center gap-2"
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                            title="Tải hợp đồng PDF"
                          >
                            <IconDownload />
                            Tải Hợp Đồng
                          </button>
                        )}

                        {/* Seller actions: trạng thái, nhắn tin, hủy khi pending */}
                        {item.role === 'seller' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-secondary flex items-center justify-center gap-2"
                              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                              onClick={() => handleOpenChatInTransaction(item)}
                            >
                              Nhắn tin với khách hàng
                            </button>
                            {item.status === 'pending' && (
                              <button
                                type="button"
                                className="btn btn-ghost flex items-center justify-center gap-2"
                                style={{
                                  fontSize: '0.875rem',
                                  padding: '0.5rem 1rem',
                                  color: 'var(--color-danger)',
                                }}
                                onClick={() => handleSellerCancel(item)}
                              >
                                Hủy tin đăng
                              </button>
                            )}
                          </>
                        )}
                        {listingId && (
                          <Link
                            to={`/products/${listingId}`}
                            rel="noopener noreferrer"
                            className="btn btn-secondary flex items-center justify-center gap-2"
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                          >
                            <IconView />
                            Xem Tin Đăng
                          </Link>
                        )}
                      </div>
                    </div>

                  )
                })}
              </div>
            </div>

            {/* CỘT PHẢI: TÓM TẮT (Giữ nguyên) */}
            <div>
              <div className="card sticky p-6" style={{ top: '1rem' }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>
                  Chờ thanh toán
                </h2>
                <div style={{ marginBottom: '1rem' }}>
                  <div className="flex justify-between mb-2" style={{ color: 'var(--text-body)' }}>
                    <span>Tạm tính (pending):</span>
                    <span>{calculateTotal().toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between mb-2" style={{ color: 'var(--text-body)' }}>
                    <span>Phí vận chuyển:</span>
                    <span>0 đ</span>
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '0.5rem',
                      color: 'var(--text-heading)'
                    }}
                    className="flex justify-between text-xl font-bold"
                  >
                    <span>Tổng (chờ):</span>
                    <span>{calculateTotal().toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>
                    Lịch sử
                  </h2>
                  <div
                    className="flex justify-between text-lg font-semibold"
                    style={{ color: 'var(--text-body)' }}
                  >
                    <span>Tổng đã mua:</span>
                    <span>{calculateTotalPaid().toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;