import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function WishlistPage() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('evb_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchWishlist();
  }, [navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wishlist/my');
      const ids = response.data?.data || response.data || [];

      if (!ids || ids.length === 0) {
        setWishlistItems([]);
        return;
      }

      // Fetch details in parallel
      const promises = ids.map(id => 
        api.get(`/listings/${id}`).catch(() => null)
      );
      const items = await Promise.all(promises);
      setWishlistItems(items.filter(item => item !== null).map(item => item.data));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (listingId) => {
    try {
      await api.delete(`/wishlist/${listingId}`);
      alert('Đã xóa khỏi wishlist');
      fetchWishlist();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="loading-container text-center py-20">
        <div className="loading-spinner-simple"></div>
        <p className="text-xl mt-4" style={{ color: 'var(--text-body)' }}>Đang tải wishlist...</p>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-heading)' }}>Danh sách yêu thích</h1>

        {wishlistItems.length === 0 ? (
          <div className="card text-center py-20">
            <div style={{ color: '#9ca3af', margin: '0 auto', fontSize: '3rem' }}>
              <IconEmptyBox />
            </div>
            <p className="text-xl my-4" style={{ color: 'var(--text-body)' }}>Danh sách yêu thích trống</p>
            <Link to="/products" className="btn btn-primary">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-1 grid-md-2 grid-lg-4" style={{ gap: '1.5rem' }}>
            {wishlistItems.map((item) => {
              const itemId = item._id || item.id;
              const imageUrl = item.images && item.images[0];
              return (
                <div key={itemId} className="product-card-modern">
                  <div className="product-image-container">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title || 'Listing Image'}
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
                  <div className="product-info p-4">
                    <h3 className="product-title font-semibold text-lg">
                      {item.title || 'Sản phẩm không tên'}
                    </h3>
                    <p className="product-price text-lg font-bold mt-3">
                      {item.price ? `${item.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                    </p>
                    <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                      <Link to={`/products/${itemId}`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                        Xem
                      </Link>
                      <button
                        onClick={() => handleRemoveFromWishlist(itemId)}
                        className="btn btn-secondary"
                      >
                        Xóa
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

export default WishlistPage;

