import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

// === ICONS ===
// Thêm các icon cần thiết
const IconImagePlaceholder = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconEmptyBox = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </svg>
);
const IconPencil = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
);
const IconTrash = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

// === COMPONENT ===
function MyListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('evb_token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyListings();
  }, [navigate]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/listings/my?limit=50');
      const listingsData = response.data?.data || [];
      setListings(listingsData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching my listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tin đăng này không?')) return;

    try {
      await api.delete(`/listings/${listingId}`);
      alert('Tin đăng đã được xóa.');
      fetchMyListings(); // Tải lại danh sách sau khi xóa
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // 1. NÂNG CẤP TRẠNG THÁI LOADING
  if (loading) {
    return (
      <div className="loading-container text-center py-20">
        <div className="loading-spinner-simple"></div>
        <p className="text-xl mt-4" style={{ color: 'var(--text-body)' }}>
          Đang tải tin đăng của bạn...
        </p>
      </div>
    );
  }

  // 2. NÂNG CẤP TRẠNG THÁI LỖI
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

  return (
    // Sử dụng CSS Variable cho nền
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-heading)' }}>
          Tin đăng của tôi ({listings.length})
        </h1>

        {listings.length === 0 ? (
          // 3. NÂNG CẤP TRẠNG THÁI RỖNG
          <div className="card text-center py-20">
            <div style={{ color: '#9ca3af', margin: '0 auto', fontSize: '3rem' }}>
              <IconEmptyBox />
            </div>
            <p className="text-xl my-4" style={{ color: 'var(--text-body)' }}>
              Bạn chưa có tin đăng nào
            </p>
            <Link to="/create" className="btn btn-primary">
              Tạo tin đăng mới
            </Link>
          </div>
        ) : (
          <div className="grid grid-1 grid-md-2 grid-lg-3" style={{ gap: '1.5rem' }}>
            {listings.map((listing) => {
              const listingId = listing._id || listing.id;
              const imageUrl = listing.images && listing.images[0];

              return (
                // 4. SỬ DỤNG CLASS CARD MỚI
                <div key={listingId} className="product-card-modern">

                  {/* 5. CẬP NHẬT CẤU TRÚC ẢNH */}
                  <div className="product-image-container">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={listing.title || 'Listing Image'}
                        className="product-image-modern"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <div className="text-gray-400">
                          <IconImagePlaceholder />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 6. CẬP NHẬT PHẦN THÔNG TIN */}
                  <div className="product-info p-4">
                    <h3 className="product-title font-semibold text-lg">
                      {listing.title || 'Sản phẩm không tên'}
                    </h3>

                    {/* 7. THÊM STATUS BADGE */}
                    <div className="mb-2 mt-1">
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: listing.status === 'ACTIVE' ? 'var(--color-danger-light)' : 'var(--bg-muted)',
                        color: listing.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--text-body)',
                      }}>
                        {listing.status}
                      </span>
                    </div>

                    <p className="product-price text-lg font-bold mt-3">
                      {listing.price ? `${listing.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                    </p>

                    {/* 8. NÂNG CẤP NHÓM NÚT BẤM */}
                    <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                      <Link
                        to={`/products/${listingId}`}
                        className="btn btn-primary"
                        style={{ flex: 1, textAlign: 'center' }}
                      >
                        Xem
                      </Link>

                      <Link
                        to={`/edit/${listingId}`}
                        className="btn"
                        title="Sửa"
                        style={{
                          background: 'var(--bg-muted)',
                          color: 'var(--text-heading)',
                          border: '1px solid var(--color-border)',
                          padding: '0.5rem 0.75rem'
                        }}
                      >
                        <IconPencil />
                      </Link>

                      <button
                        onClick={() => handleDeleteListing(listingId)}
                        className="btn"
                        title="Xóa"
                        style={{
                          background: 'transparent',
                          color: 'var(--color-danger)',
                          border: '1px solid var(--color-danger)',
                          padding: '0.5rem 0.75rem'
                        }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyListingsPage;