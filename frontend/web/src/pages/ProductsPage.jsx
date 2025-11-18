import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') || '').trim();
  const [filters, setFilters] = useState({
    location: '',
    model: '',
    minPrice: '',
    maxPrice: '',
  });
  const [filterOpen, setFilterOpen] = useState(false);

  const hasActiveFilter =
    filters.location || filters.model || filters.minPrice || filters.maxPrice;

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      location: '',
      model: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const handleToggleFilter = () => {
    setFilterOpen((prev) => !prev);
  };

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.filter((item) => {
      const {
        location: filterLocation,
        model: filterModel,
        minPrice,
        maxPrice,
      } = filters;

      if (filterLocation) {
        const itemLocation = (item.location || '').toString().toLowerCase();
        if (!itemLocation.includes(filterLocation.toLowerCase())) {
          return false;
        }
      }

      if (filterModel) {
        const itemModel =
          (item.vehicle_model ||
            item.model ||
            item.vehicleModel ||
            '').toString().toLowerCase();

        if (!itemModel.includes(filterModel.toLowerCase())) {
          return false;
        }
      }

      let priceValue = item.price;
      if (typeof priceValue === 'string') {
        const numeric = parseFloat(priceValue.replace(/[^\d.]/g, ''));
        priceValue = Number.isNaN(numeric) ? undefined : numeric;
      }

      if (minPrice) {
        const minVal = Number(minPrice);
        if (!Number.isNaN(minVal)) {
          if (!priceValue || priceValue < minVal) return false;
        }
      }

      if (maxPrice) {
        const maxVal = Number(maxPrice);
        if (!Number.isNaN(maxVal)) {
          if (!priceValue || priceValue > maxVal) return false;
        }
      }

      return true;
    });
  }, [products, filters]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Endpoint theo evb_trading_platform_frontend.html
        // Thử search trước, nếu lỗi thì fallback về listings/public
        let response;
        try {
          response = await api.get(`/search/listings/?q=${encodeURIComponent(searchQuery)}&sort_by=newest&limit=12`);
          // Xử lý response data theo format từ HTML
          let listings = [];
          const data = response.data;
          if (data?.data?.listings && Array.isArray(data.data.listings)) {
            listings = data.data.listings;
          } else if (data?.listings && Array.isArray(data.listings)) {
            listings = data.listings;
          } else if (data?.data && Array.isArray(data.data)) {
            listings = data.data;
          } else if (Array.isArray(data)) {
            listings = data;
          }
          setProducts(listings);
        } catch (searchErr) {
          // Fallback to public listings
          response = await api.get('/listings/public');
          const data = response.data;
          let listings = [];
          if (data?.data && Array.isArray(data.data)) {
            listings = data.data;
          } else if (Array.isArray(data)) {
            listings = data;
          }
          setProducts(listings);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="loading-container text-center py-20">
        <div className="loading-spinner-simple"></div>
        <p className="text-xl mt-4" style={{ color: 'var(--text-body)' }}>Đang tải sản phẩm...</p>
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>Danh sách sản phẩm</h1>
        {searchQuery && (
          <p className="text-gray-600 mb-6">
            Kết quả tìm kiếm cho "<strong>{searchQuery}</strong>"
          </p>
        )}

        {/* Thanh nav nhỏ: nút "Lọc" */}
        <div className="filter-toggle-row">
          <button
            type="button"
            className="filter-toggle-button"
            onClick={handleToggleFilter}
          >
            <span className="filter-toggle-label">Lọc</span>
            <span
              className={`filter-toggle-icon ${
                filterOpen || hasActiveFilter ? 'filter-toggle-icon--open' : ''
              }`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>
        </div>

        {/* Bộ lọc location / model / giá dùng chung với HomePage */}
        {(filterOpen || hasActiveFilter) && (
          <div className="filter-bar card">
            <div className="filter-bar-row">
              <div className="filter-field">
                <label className="filter-label" htmlFor="products-filter-location">
                  Khu vực
                </label>
                <input
                  id="products-filter-location"
                  name="location"
                  type="text"
                  placeholder="VD: Hà Nội, TP.HCM..."
                  className="form-input filter-input"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-field">
                <label className="filter-label" htmlFor="products-filter-model">
                  Mẫu xe / Model
                </label>
                <input
                  id="products-filter-model"
                  name="model"
                  type="text"
                  placeholder="VD: VF8, VF e34..."
                  className="form-input filter-input"
                  value={filters.model}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-field filter-price-group">
                <span className="filter-label">Khoảng giá (VND)</span>
                <div className="filter-price-inputs">
                  <input
                    name="minPrice"
                    type="number"
                    min="0"
                    placeholder="Giá tối thiểu"
                    className="form-input filter-input"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                  />
                  <span className="filter-price-separator">-</span>
                  <input
                    name="maxPrice"
                    type="number"
                    min="0"
                    placeholder="Giá tối đa"
                    className="form-input filter-input"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="filter-actions">
                <button
                  type="button"
                  className="btn btn-secondary filter-button"
                  onClick={handleClearFilters}
                  disabled={loading}
                >
                  Xóa lọc
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="card text-center py-20">
            <div style={{ color: '#9ca3af', margin: '0 auto', fontSize: '3rem' }}>
              <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-xl my-4" style={{ color: 'var(--text-body)' }}>
              {searchQuery ? 'Không tìm thấy sản phẩm phù hợp với từ khóa của bạn' : 'Chưa có sản phẩm nào'}
            </p>
          </div>
        ) : (
          <div className="grid grid-1 grid-md-2 grid-lg-4" style={{ gap: '1.5rem' }}>
            {filteredProducts.map((product) => {
              const productId = product._id || product.id;
              const imageUrl = product.images && product.images[0];
              return (
                <Link
                  key={productId}
                  to={`/products/${productId}`}
                  className="product-card-modern"
                >
                  <div className="product-image-container">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.title || 'Listing Image'}
                        className="product-image-modern"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <div className="text-gray-400">
                          <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="product-info p-4">
                    <h3 className="product-title font-semibold text-lg">
                      {product.title || product.name || 'Sản phẩm không tên'}
                    </h3>
                    <p className="product-description text-sm mt-1">
                      {product.description ? product.description.substring(0, 50) + (product.description.length > 50 ? '...' : '') : 'Không có mô tả'}
                    </p>
                    <p className="product-price text-lg font-bold mt-3">
                      {product.price ? `${product.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;

