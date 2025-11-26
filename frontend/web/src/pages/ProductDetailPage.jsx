import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

// === ICONS ===
// Thêm các icon cần thiết cho trang này
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
const IconHeart = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);
const IconReport = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"></path><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);
const IconPencil = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);
const IconTrash = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const IconStar = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

// === COMPONENT ===
function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // === State (Toàn bộ state giữ nguyên) ===
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const token = localStorage.getItem('evb_token');
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });
  const [editingReview, setEditingReview] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [authorMap, setAuthorMap] = useState({});
  const [sellerOrders, setSellerOrders] = useState([]);
  const [showSellerInfo, setShowSellerInfo] = useState(false);
  const [showSellerOrders, setShowSellerOrders] = useState(false);
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    subjectId: null,
    subjectType: null,
    contextLabel: '',
  });
  const [reportReasonCode, setReportReasonCode] = useState('SPAM');
  const [reportDetails, setReportDetails] = useState('');
  const reportReasonInputRef = useRef(null);


  // === Logic (Toàn bộ logic giữ nguyên) ===
  useEffect(() => {
    const userDataString = localStorage.getItem('evb_user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setCurrentUserId(userData._id || userData.user_id);
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
      }
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        setSeller(null);
        setProduct(null);
        setMainImage(null);

        const response = await api.get(`/listings/${id}`);
        const productData = response.data.data || response.data;

        if (productData) {
          setProduct(productData);
          if (productData.images && productData.images.length > 0) {
            setMainImage(productData.images[0]);
          }

          const sellerIdFromProduct =
            productData.user_id ||
            productData.sellerId ||
            productData.userId ||
            productData.user;

          const sellerIdValue = (typeof sellerIdFromProduct === 'object' && sellerIdFromProduct !== null)
            ? sellerIdFromProduct._id
            : sellerIdFromProduct;

          if (sellerIdValue) {
            try {
              const sellerResponse = await api.get(`/auth/seller/${sellerIdValue}`);
              const sellerData = sellerResponse.data.data || sellerResponse.data;
              // Đảm bảo có _id hoặc id
              if (sellerData && !sellerData._id && sellerData.id) {
                sellerData._id = sellerData.id;
              }
              // Nếu vẫn không có _id, dùng sellerIdValue làm _id
              if (sellerData && !sellerData._id) {
                sellerData._id = sellerIdValue;
              }
              setSeller(sellerData);
            } catch (err) {
              console.error('Error fetching seller:', err);
              setSeller({ 
                _id: sellerIdValue, 
                username: 'Không rõ', 
                phonenumber: 'N/A', 
                email: 'N/A' 
              });
            }
          } else {
            setSeller({ username: 'Không rõ', phonenumber: 'N/A', email: 'N/A' });
          }

          await loadReviews();
          await loadReviewStats();
        } else {
          setError('Không tìm thấy thông tin sản phẩm.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  useEffect(() => {
    if (reviews.length === 0) return;
    const fetchAuthorNames = async () => {
      const newUserIds = [...new Set(reviews.map(review => review.userId).filter(userId => userId && !authorMap[userId]))];
      if (newUserIds.length === 0) return;
      const authorPromises = newUserIds.map(userId =>
        api.get(`/auth/seller/${userId}`)
          .then(response => {
            const userData = response.data.data || response.data;
            return { id: userId, name: userData.username || 'User không tồn tại' };
          })
          .catch(err => ({ id: userId, name: 'User không tồn tại' }))
      );
      const authors = await Promise.all(authorPromises);
      const newAuthorMap = authors.reduce((map, author) => {
        map[author.id] = author.name;
        return map;
      }, {});
      setAuthorMap(prevMap => ({ ...prevMap, ...newAuthorMap }));
    };
    fetchAuthorNames();
  }, [reviews]);

  useEffect(() => {
    if (reportModal.isOpen && reportReasonInputRef.current) {
      reportReasonInputRef.current.focus();
    }
  }, [reportModal.isOpen]);


  const loadReviews = async () => { /* (Giữ nguyên) */
    try {
      const response = await api.get(`/reviews/listing/${id}`);
      setReviews(response.data?.data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };
  const loadReviewStats = async () => { /* (Giữ nguyên) */
    try {
      const response = await api.get(`/reviews/stats/${id}`);
      setReviewStats(response.data?.data || { average: 0, count: 0 });
    } catch (err) {
      console.error('Error loading review stats:', err);
    }
  };
  const loadSellerOrders = async (sellerId) => { /* (Giữ nguyên) */
    if (!sellerId) return;
    try {
      const response = await api.get(`/transactions/seller/${sellerId}`);
      setSellerOrders(response.data?.data || []);
    } catch (err) {
      console.error('Error loading seller orders:', err);
      setSellerOrders([]);
    }
  };
  const handleBuy = async () => { /* (Giữ nguyên) */
    if (!token) { navigate('/login'); return; }
    const sellerId = product.sellerId || product.user_id || product.userId || product.user;
    const price = product.price;
    let transactionType = product.category === 'Battery' ? 'pin' : 'xe';
    if (!price || price <= 0) { alert('Lỗi: Sản phẩm này không có giá hoặc giá không hợp lệ.'); return; }
    if (!sellerId) { alert('Lỗi: Không tìm thấy thông tin người bán của sản phẩm này.'); return; }
    try {
      await api.post('/transactions/orders/', { listingId: id, type: transactionType });
      alert('Đã tạo đơn hàng');
      navigate('/cart');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message;
      if (err.response?.data?.requiresProfileUpdate) {
        const shouldUpdate = window.confirm(
          'Bạn phải cập nhật đầy đủ Họ và Tên trước khi thực hiện giao dịch.\n\nBạn có muốn chuyển đến trang Profile để cập nhật ngay bây giờ?'
        );
        if (shouldUpdate) {
          navigate('/profile');
        }
      } else {
        alert('Lỗi khi tạo đơn hàng: ' + errorMessage);
      }
    }
  };
  const handleAddToWishlist = async () => { /* (Giữ nguyên) */
    if (!token) { navigate('/login'); return; }
    try {
      await api.post('/wishlist/', { listingId: id });
      alert('Đã thêm vào wishlist');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };
  const openReportModal = (subjectId, subjectType, contextLabel) => {
    if (!token) { navigate('/login'); return; }
    setReportReasonCode('SPAM');
    setReportDetails('');
    setReportModal({
      isOpen: true,
      subjectId,
      subjectType,
      contextLabel,
    });
  };

  const closeReportModal = () => {
    setReportModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmitReport = async (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    if (!token) { navigate('/login'); return; }
    if (!reportModal.subjectId || !reportModal.subjectType) return;
    if (!reportReasonCode || !reportReasonCode.trim()) {
      alert('Vui lòng chọn hoặc nhập mã lý do báo cáo.');
      return;
    }
    try {
      await api.post('/reports/', {
        subjectId: reportModal.subjectId,
        subjectType: reportModal.subjectType,
        reasonCode: reportReasonCode.trim(),
        details: reportDetails.trim() || undefined,
      });
      closeReportModal();
      alert('Báo cáo đã được gửi.');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReport = () => {
    openReportModal(id, 'LISTING', 'tin đăng');
  };
  const handleSubmitReview = async () => { /* (Giữ nguyên) */
    if (!token) { navigate('/login'); return; }
    try {
      await api.post('/reviews/', { listingId: id, rating: parseInt(reviewRating), content: reviewContent.trim() });
      alert('Đã gửi đánh giá');
      setReviewContent('');
      setReviewRating('5');
      await loadReviews();
      await loadReviewStats();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };
  const handleReportReview = (reviewId) => {
    openReportModal(reviewId, 'REVIEW', 'đánh giá');
  };
  const handleDeleteReview = async (reviewId) => { /* (Giữ nguyên) */
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      alert('Đã xóa đánh giá');
      await loadReviews();
      await loadReviewStats();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };
  const handleStartEdit = (review) => { /* (Giữ nguyên) */
    setEditingReview({ id: review._id || review.id, content: review.content, rating: review.rating.toString() });
  };
  const handleCancelEdit = () => { /* (Giữ nguyên) */
    setEditingReview(null);
  };
  const handleUpdateReview = async () => { /* (Giữ nguyên) */
    if (!editingReview) return;
    try {
      await api.put(`/reviews/${editingReview.id}`, { content: editingReview.content.trim(), rating: parseInt(editingReview.rating) });
      alert('Đã cập nhật đánh giá');
      setEditingReview(null);
      await loadReviews();
      await loadReviewStats();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };
  const handleReportUser = (userIdToReport) => {
    openReportModal(userIdToReport, 'USER', 'người dùng');
  };


  const handleOpenChat = async () => {
    // Lấy seller ID linh hoạt (_id hoặc id)
    const sellerId = seller?._id || seller?.id;
    
    if (!sellerId) {
      alert('Không tìm thấy thông tin người bán.');
      return;
    }

    if (!currentUserId) {
      alert('Bạn phải đăng nhập trước.');
      navigate('/login');
      return;
    }

    if (sellerId === currentUserId) {
      alert('Bạn không thể nhắn tin với chính mình.');
      return;
    }

    try {
      // Gọi API để tạo hoặc lấy phòng chat
      const response = await api.post('/chat/rooms', { 
        receiverId: sellerId 
      });
      
      // Backend trả về { success: true, roomId: "...", data: {...} }
      const roomData = response.data || response;
      const roomId = roomData?.roomId || roomData?.data?.roomId || roomData?._id || roomData?.id;
      
      if (!roomId) {
        throw new Error('Không thể tạo hoặc lấy phòng chat.');
      }

      // Navigate đến trang chat với roomId
      navigate(`/chat/${roomId}`);
    } catch (err) {
      console.error('Error creating/getting chat room:', err);
      alert(err.response?.data?.message || err.message || 'Lỗi khi tạo cuộc trò chuyện');
    }
  };


  // === NÂNG CẤP: GUARD CLAUSES (Loading, Error, Not Found) ===
  if (loading) {
    return (
      <div className="loading-container text-center py-20">
        <div className="loading-spinner-simple"></div>
        <p className="text-xl mt-4" style={{ color: 'var(--text-body)' }}>
          Đang tải thông tin sản phẩm...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container text-center py-20">
        <div style={{ color: '#9ca3af', fontSize: '3rem' }}>
          <IconEmptyBox />
        </div>
        <h3 className="mt-2 text-xl font-semibold" style={{ color: 'var(--text-heading)' }}>
          {error ? 'Lỗi tải sản phẩm' : 'Không tìm thấy sản phẩm'}
        </h3>
        <p className="mt-1 mb-4" style={{ color: 'var(--text-body)' }}>
          {error ? error : 'Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.'}
        </p>
        <Link to="/" className="btn btn-primary">
          Quay về Trang chủ
        </Link>
      </div>
    );
  }

  // === NÂNG CẤP: JSX (RENDER) ===
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      {reportModal.isOpen && (
        <div
          className="evb-report-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998,
          }}
          onClick={closeReportModal}
        >
          <div
            className="evb-report-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '92%',
              background:
                'linear-gradient(135deg, #ffffff 0%, #f9fafb 30%, #eff6ff 100%)',
              borderRadius: '18px',
              boxShadow:
                '0 22px 55px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(148, 163, 184, 0.35)',
              padding: '20px 22px 18px',
              color: '#0f172a',
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '999px',
                  background:
                    'radial-gradient(circle at 30% 30%, #fee2e2, #dc2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 2px rgba(254, 226, 226, 0.9)',
                  color: 'white',
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                !
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-heading)', marginBottom: 4 }}
                >
                  Báo cáo {reportModal.contextLabel || 'nội dung'}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-body)', marginBottom: 12 }}
                >
                  Hãy chọn lý do phù hợp và mô tả chi tiết (nếu có). Đội ngũ kiểm
                  duyệt sẽ xem xét trong thời gian sớm nhất.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitReport}>
              <div className="form-group">
                <label
                  htmlFor="report-reason"
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--text-heading)' }}
                >
                  Mã lý do
                </label>
                <select
                  id="report-reason"
                  ref={reportReasonInputRef}
                  className="form-input"
                  value={reportReasonCode}
                  onChange={(e) => setReportReasonCode(e.target.value)}
                  required
                >
                  <option value="SPAM">
                    SPAM - Quảng cáo, nội dung lặp lại, link độc hại
                  </option>
                  <option value="HARASSMENT">
                    HARASSMENT - Quấy rối, xúc phạm, lời nói căm ghét
                  </option>
                  <option value="OTHER">OTHER - Lý do khác</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '0.9rem' }}>
                <label
                  htmlFor="report-details"
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--text-heading)' }}
                >
                  Chi tiết (tùy chọn)
                </label>
                <textarea
                  id="report-details"
                  className="form-input"
                  rows="4"
                  placeholder="Mô tả thêm về lý do bạn báo cáo để chúng tôi xử lý tốt hơn..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div
                className="mt-4 flex justify-end gap-2"
                style={{ marginTop: '1.1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeReportModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="container py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          ← Quay lại
        </button>

        {/* === BỐ CỤC 2 CỘT === */}
        <div className="card card-lg" style={{ padding: 0 }}>
          <div className="grid grid-1 grid-md-2">

            {/* === CỘT TRÁI: THƯ VIỆN ẢNH (Sticky) === */}
            <div className="p-4 md:p-8 md:sticky top-4 self-start">
              {/* Ảnh chính */}
              <div
                className="w-full mb-4 overflow-hidden"
                style={{
                  aspectRatio: '16 / 10',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--bg-muted)'
                }}
              >
                {mainImage ? (
                  <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    <div className="text-center">
                      <div style={{ fontSize: '3rem' }}><IconImagePlaceholder /></div>
                      <p className="font-medium">Không có ảnh</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Danh sách thumbnail */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {product.images.map((imgUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setMainImage(imgUrl)}
                      className="w-20 h-20 overflow-hidden focus:outline-none transition-all"
                      style={{
                        borderRadius: 'var(--radius-sm)',
                        border: `2px solid ${mainImage === imgUrl ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        opacity: mainImage === imgUrl ? 1 : 0.7,
                      }}
                    >
                      <img src={imgUrl} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* === CỘT PHẢI: THÔNG TIN SẢN PHẨM === */}
            <div className="p-4 md:p-8 border-l border-gray-200">
              <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>
                {product.title || product.name || 'Sản phẩm không tên'}
              </h1>
              <div className="mb-2" style={{ color: 'var(--text-body)' }}>
                {product.location || 'Chưa rõ'} • {product.condition || 'Không rõ'}
              </div>
              <p className="text-3xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
                {product.price ? `${product.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
              </p>

              {/* THÔNG TIN NGƯỜI BÁN */}
              <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>
                  Thông tin người bán
                </h3>
                {seller ? (
                  <div className="flex flex-col gap-1 text-sm" style={{ color: 'var(--text-body)' }}>
                    <p><strong>👤 Tên:</strong> {seller.username || 'Chưa cập nhật'}</p>
                    <p><strong>📞 Điện thoại:</strong> {seller.phonenumber || 'Không có'}</p>
                    <p><strong>✉️ Email:</strong> {seller.email || 'Không có'}</p>

                    {(seller._id || seller.id) !== currentUserId && (
                      <button
                        type="button"
                        onClick={handleOpenChat}
                        className="btn btn-primary mt-3 text-sm"
                      >
                        Chat với người bán
                      </button>
                    )}

                    <button onClick={() => setShowSellerInfo(prev => !prev)} className="btn btn-secondary mt-2 text-sm">
                      {showSellerInfo ? 'Ẩn thông tin bổ sung' : 'Xem thông tin bổ sung'}
                    </button>

                    {showSellerInfo && (
                      <div className="mt-2 text-xs" style={{ color: 'var(--text-body)', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        <p><strong>ID người bán:</strong> {seller._id || seller.id || 'N/A'}</p>
                        <p><strong>Số đơn đã bán:</strong> {sellerOrders.length}</p>
                        <button
                          onClick={() => { 
                            setShowSellerOrders(prev => !prev); 
                            if (!showSellerOrders) {
                              const sellerId = seller._id || seller.id;
                              if (sellerId) loadSellerOrders(sellerId);
                            }
                          }}
                          className="btn btn-secondary mt-2 text-xs"
                        >
                          {showSellerOrders ? 'Ẩn đơn bán' : 'Xem danh sách đơn bán'}
                        </button>
                        {showSellerOrders && sellerOrders.length > 0 ? (
                          <ul className="ml-4 list-disc mt-2">
                            {sellerOrders.map(order => (
                              <li key={order._id || order.id}>
                                {order.listingTitle || order.listingId} - {order.status} - {order.price.toLocaleString('vi-VN')} VND
                              </li>
                            ))}
                          </ul>
                        ) : showSellerOrders ? <p>Chưa có đơn hàng nào.</p> : null}
                      </div>
                    )}

                    {((seller._id || seller.id) !== currentUserId) && (
                      <button
                        onClick={() => handleReportUser(seller._id || seller.id)}
                        className="btn mt-2 text-sm flex items-center justify-center gap-2"
                        style={{ color: 'var(--color-danger)', background: 'var(--color-danger-light)', border: '1px solid var(--color-danger)' }}
                      >
                        <IconReport /> Báo cáo người bán
                      </button>
                    )}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-body)' }}>Đang tải thông tin người bán...</p>
                )}
              </div>

              {/* MÔ TẢ */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>Mô tả</h2>
                <p style={{ color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>
                  {product.description || 'Không có mô tả'}
                </p>
              </div>

              {/* NÚT HÀNH ĐỘNG */}
              <div className="flex gap-2 mb-2">
                {product.status === 'Sold' ? (
                  // 1. Nếu đã bán: Hiển thị nút "Đã bán" và vô hiệu hóa nó
                  <button
                    disabled
                    className="btn btn-secondary flex-1" // Đổi sang style "secondary" (hoặc "disabled")
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  >
                    Đã bán
                  </button>
                ) : (
                  // 2. Nếu chưa bán: Giữ logic "Mua ngay" cũ
                  <button
                    onClick={handleBuy}
                    disabled={!token}
                    className="btn btn-primary flex-1"
                    style={{ opacity: !token ? 0.5 : 1 }}
                  >
                    Mua ngay
                  </button>
                )}
                <button
                  onClick={handleAddToWishlist}
                  disabled={!token}
                  className="btn btn-secondary"
                  style={{ opacity: !token ? 0.5 : 1, padding: '0.75rem' }}
                  title="Thích"
                >
                  <IconHeart />
                </button>
              </div>
              <button
                onClick={handleReport}
                disabled={!token}
                className="btn w-full text-sm flex items-center justify-center gap-2"
                style={{
                  opacity: !token ? 0.5 : 1,
                  color: 'var(--color-danger)',
                  background: 'transparent',
                  border: '1px solid var(--color-danger)'
                }}
              >
                <IconReport /> Báo cáo tin đăng
              </button>
            </div>
          </div>
        </div>

        {/* === PHẦN ĐÁNH GIÁ (BÊN NGOÀI CARD CHÍNH) === */}
        <div className="card card-lg mt-8 p-4 md:p-8">
          <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>
            Đánh giá
          </h3>

          <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
            <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>Thống kê</h4>
            <p style={{ color: 'var(--text-body)' }}><strong>Tổng số đánh giá:</strong> {reviewStats.count}</p>
            <p style={{ color: 'var(--text-body)' }}>
              <strong>Rating trung bình:</strong> {reviewStats.average ? reviewStats.average.toFixed(1) : 'Chưa có'} / 5
              {reviewStats.average > 0 && <IconStar style={{ color: '#f59e0b', display: 'inline', marginLeft: '4px' }} />}
            </p>
          </div>

          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-body)' }}>Chưa có đánh giá nào.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map(review => {
                const reviewId = review._id || review.id;
                const isOwner = review.userId === currentUserId;
                const isEditing = editingReview && editingReview.id === reviewId;

                return (
                  <div
                    key={reviewId}
                    className="p-4 rounded-lg"
                    style={{
                      border: '1px solid var(--color-border)',
                      background: isEditing ? '#fefce8' : 'var(--bg-card)'
                    }}
                  >
                    {isEditing ? (
                      <div>
                        <h4 className="text-lg font-semibold mb-2">Chỉnh sửa đánh giá</h4>
                        <textarea rows="3" className="form-input mb-2 w-full" value={editingReview.content} onChange={e => setEditingReview({ ...editingReview, content: e.target.value })} />
                        <select className="form-input mb-2" value={editingReview.rating} onChange={e => setEditingReview({ ...editingReview, rating: e.target.value })}>
                          {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} sao</option>)}
                        </select>
                        <div className="flex gap-2 mt-2">
                          <button onClick={handleUpdateReview} className="btn btn-primary">Lưu</button>
                          <button onClick={handleCancelEdit} className="btn btn-secondary">Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <strong style={{ color: 'var(--text-heading)' }}>{authorMap[review.userId] || 'Người dùng'}</strong>
                          <span className="flex items-center" style={{ color: '#f59e0b', fontWeight: 600 }}>
                            {review.rating} <IconStar />
                          </span>
                        </div>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-body)' }}>
                          {new Date(review.createdAt).toLocaleString()}
                        </p>
                        <p style={{ color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>{review.content || '...'}</p>

                        {token && (
                          <div className="mt-2 flex gap-2">
                            {isOwner && (
                              <>
                                <button onClick={() => handleStartEdit(review)} className="btn btn-secondary text-sm flex items-center gap-1">
                                  <IconPencil /> Sửa
                                </button>
                                <button onClick={() => handleDeleteReview(reviewId)} className="btn text-sm flex items-center gap-1" style={{ color: 'var(--color-danger)', border: '1px solid var(--color-danger-light)', background: 'var(--color-danger-light)' }}>
                                  <IconTrash /> Xóa
                                </button>
                              </>
                            )}
                            {!isOwner && (
                              <button onClick={() => handleReportReview(reviewId)} className="btn btn-secondary text-sm flex items-center gap-1">
                                <IconReport /> Báo cáo
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Form gửi đánh giá */}
          {token && !editingReview && (
            <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
              <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>Gửi đánh giá</h4>
              <textarea className="form-input w-full mb-2" rows="3" placeholder="Nhập nội dung đánh giá" value={reviewContent} onChange={e => setReviewContent(e.target.value)}></textarea>
              <select className="form-input mb-2" value={reviewRating} onChange={e => setReviewRating(e.target.value)}>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
              <button onClick={handleSubmitReview} className="btn btn-primary mt-2">Gửi đánh giá</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;