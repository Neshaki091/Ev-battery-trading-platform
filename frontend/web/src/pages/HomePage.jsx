import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import '../css/HomePage.css';

const IconImagePlaceholder = () => (
  <svg
    className="icon-svg"
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const IconEmptyBox = () => (
  <svg
    className="icon-svg"
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
    />
  </svg>
);

const STAT_CARDS = [
  {
    value: '1.200+',
    label: 'Tin đăng đang hoạt động',
    description:
      'Nguồn hàng phong phú, cập nhật mỗi ngày cho cả người mua và người bán.'
  },
  {
    value: '98%',
    label: 'Người dùng hài lòng',
    description:
      'Được đánh giá 4.8/5 bởi cộng đồng giao dịch năng lượng xanh trên toàn quốc.'
  },
  {
    value: '24/7',
    label: 'Hỗ trợ chuyên sâu',
    description:
      'Đội ngũ tư vấn sẵn sàng đồng hành trong suốt hành trình giao dịch của bạn.'
  }
];

const CATEGORY_CARDS = [
  {
    icon: '🚗',
    title: 'Xe Điện Hoàn Chỉnh',
    description: 'Ô tô, xe máy, xe đạp điện và các dòng xe nhập khẩu cao cấp.',
    category: 'Vehicle',
    gradient: 'linear-gradient(135deg, rgba(37,99,235,0.16), rgba(56,189,248,0.22))'
  },
  {
    icon: '🔋',
    title: 'Pin & Module',
    description: 'Pin lithium LFP, module đổi pin, pack lắp ráp theo yêu cầu.',
    category: 'Battery',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.16), rgba(59,130,246,0.18))'
  },
  {
    icon: '⚙️',
    title: 'Phụ Tùng & Trạm Sạc',
    description: 'Trạm sạc AC/DC, bộ chuyển đổi, phụ tùng thay thế đồng bộ.',
    category: 'Accessory',
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.18), rgba(167,139,250,0.16))'
  },
  {
    icon: '🌱',
    title: 'Giải Pháp Năng Lượng',
    description: 'Giải pháp lưu trữ, microgrid và các dịch vụ hậu mãi chuyên sâu.',
    category: 'Solution',
    gradient: 'linear-gradient(135deg, rgba(96,165,250,0.16), rgba(45,212,191,0.22))'
  }
];

const BENEFIT_CARDS = [
  {
    icon: '🛡️',
    title: 'Giao dịch minh bạch',
    description:
      'Xác minh người bán nhiều lớp, hợp đồng điện tử và lưu trữ hồ sơ an toàn.',
    accent: '#2563eb',
    points: ['Đánh giá hai chiều rõ ràng', 'Giám sát tiến trình giao dịch', 'Thông báo tức thời qua app']
  },
  {
    icon: '🤝',
    title: 'Kết nối đối tác phù hợp',
    description:
      'Thuật toán gợi ý giúp bạn tìm đúng nguồn hàng hoặc khách mua tiềm năng.',
    accent: '#0f766e',
    points: ['Lọc theo nhu cầu cụ thể', 'Đề xuất ưu tiên nhà cung cấp uy tín', 'Lịch hẹn xem hàng linh hoạt']
  },
  {
    icon: '📈',
    title: 'Dữ liệu chuyên sâu',
    description:
      'Nắm bắt xu hướng giá, tồn kho và dự báo cung cầu để ra quyết định chính xác.',
    accent: '#7c3aed',
    points: ['Bảng so sánh giá theo thời gian', 'Thông tin thị trường cập nhật', 'Báo cáo tùy chỉnh theo danh mục']
  }
];

const INSIGHT_CARDS = [
  {
    tag: 'Xu hướng',
    title: 'Giá pin LFP giảm 8% trong 30 ngày gần đây',
    caption: 'Theo dõi biến động để tối ưu chi phí nhập hàng và bảo đảm biên lợi nhuận.'
  },
  {
    tag: 'Gợi ý',
    title: 'Top 10 nhà cung cấp trạm sạc nhanh uy tín 2025',
    caption: 'Danh sách được đội ngũ EVB xác minh, cập nhật theo phản hồi từ cộng đồng.'
  },
  {
    tag: 'Câu chuyện',
    title: 'Đổi pin thuê bao chỉ trong 15 phút cho đội xe giao hàng',
    caption: 'Chia sẻ kinh nghiệm triển khai thực tế từ các doanh nghiệp quy mô lớn.'
  }
];

const HERO_BAR_HEIGHTS = [42, 68, 52, 80, 58, 72];

function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    model: '',
    minPrice: '',
    maxPrice: '',
  });
  const [filterOpen, setFilterOpen] = useState(false);

  const location = useLocation();

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

  const filteredListings = useMemo(() => {
    if (!listings || listings.length === 0) return [];

    return listings.filter((item) => {
      const {
        location: filterLocation,
        model: filterModel,
        minPrice,
        maxPrice,
      } = filters;

      // Filter by location (partial match, case-insensitive)
      if (filterLocation) {
        const itemLocation = (item.location || '').toString().toLowerCase();
        if (!itemLocation.includes(filterLocation.toLowerCase())) {
          return false;
        }
      }

      // Filter by model (for Vehicle category, use vehicle_model if available)
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

      // Normalize price to number (if possible)
      let priceValue = item.price;
      if (typeof priceValue === 'string') {
        const numeric = parseFloat(priceValue.replace(/[^\d.]/g, ''));
        priceValue = Number.isNaN(numeric) ? undefined : numeric;
      }

      // Filter by min price
      if (minPrice) {
        const minVal = Number(minPrice);
        if (!Number.isNaN(minVal)) {
          if (!priceValue || priceValue < minVal) return false;
        }
      }

      // Filter by max price
      if (maxPrice) {
        const maxVal = Number(maxPrice);
        if (!Number.isNaN(maxVal)) {
          if (!priceValue || priceValue > maxVal) return false;
        }
      }

      return true;
    });
  }, [listings, filters]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);

        const urlParams = new URLSearchParams(location.search);
        const category = urlParams.get('category') || '';
        const path = `/search/listings/?q=&sort_by=newest&limit=12&category=${category}`;

        let data;
        try {
          data = await api.get(path);
        } catch (searchError) {
          console.warn('Search API failed, falling back to public listings.', searchError);
          data = await api.get('/listings/public');
        }

        let listingsData = [];
        const responseData = data.data;
        if (responseData?.data?.listings && Array.isArray(responseData.data.listings)) {
          listingsData = responseData.data.listings;
        } else if (responseData?.listings && Array.isArray(responseData.listings)) {
          listingsData = responseData.listings;
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          listingsData = responseData.data;
        } else if (Array.isArray(responseData)) {
          listingsData = responseData;
        }

        setListings(listingsData);
      } catch (error) {
        console.error('Error loading listings:', error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  useEffect(() => {
    if (location.hash === '#product-grid' && !loading) {
      const target = document.querySelector('#product-grid');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.hash, loading]);

  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal-item');
    if (!revealElements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [listings, loading]);

  return (
    <div className="homepage">
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content reveal-item">
            <span className="hero-badge">EV Battery Marketplace</span>
            <h1 className="hero-title">Khởi động giao dịch năng lượng xanh của bạn</h1>
            <p className="hero-description">
              Nền tảng chuyên nghiệp giúp kết nối người mua và người bán xe điện, pin, phụ tùng với tốc độ vượt trội và trải nghiệm trọn vẹn.
            </p>
            <div className="hero-actions">
              <Link to="/create" className="btn btn-primary hero-action">
                Đăng tin ngay
              </Link>
              <a href="#product-grid" className="btn hero-action hero-secondary">
                Tin đăng nổi bật
              </a>
            </div>
            <div className="hero-meta">
              <div className="hero-meta-item">
                <span className="hero-dot" />
                <span>Đăng tin miễn phí, tiếp cận ngay cộng đồng giao dịch chuyên nghiệp và đáng tin cậy.</span>
              </div>
              <div className="hero-meta-item">
                <span className="hero-dot" />
                <span>Gợi ý đối tác phù hợp dựa trên nhu cầu, ngân sách và khu vực của bạn.</span>
              </div>
            </div>
          </div>
          <div className="hero-visual reveal-item">
            <div className="hero-card hero-card-primary">
              <div className="hero-card-header">
                <span className="hero-card-badge">Thị trường tức thời</span>
                <h3>Biểu đồ cung cầu</h3>
                <p>Cập nhật liên tục dữ liệu giao dịch pin và xe điện trên toàn quốc.</p>
              </div>
              <div className="hero-sparkline">
                {HERO_BAR_HEIGHTS.map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    style={{ height: `${height}px`, animationDelay: `${index * 0.12}s` }}
                  />
                ))}
              </div>
              <div className="hero-card-footer">
                <div>
                  <strong>+18%</strong>
                  <span>Nhu cầu pin tái chế</span>
                </div>
                <div>
                  <strong>3.2 giờ</strong>
                  <span>Thời gian hoàn tất giao dịch</span>
                </div>
              </div>
            </div>
            <div className="hero-card hero-card-secondary">
              <span className="hero-secondary-icon" aria-hidden="true">
                ⚡
              </span>
              <h4>Tín hiệu thị trường</h4>
              <p>Nhận cảnh báo xu hướng giá, báo giá mới và lịch hẹn tiềm năng ngay khi xuất hiện.</p>
              <div className="hero-pill-group">
                <span className="hero-pill">Đối tác uy tín</span>
                <span className="hero-pill">Báo giá nhanh</span>
                <span className="hero-pill">Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>
        <span className="hero-shape hero-shape-1" />
        <span className="hero-shape hero-shape-2" />
      </section>

      <section className="stats-section">
        <div className="container stats-grid">
          {STAT_CARDS.map((stat, index) => (
            <div
              key={stat.label}
              className="stat-card reveal-item"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
              <p>{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="category-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-badge">Danh mục chính</span>
              <h2 className="section-title">Khám phá theo nhu cầu</h2>
              <p className="section-description">
                Chọn danh mục bạn quan tâm để xem nhanh các tin đăng phù hợp và xu hướng nổi bật.
              </p>
            </div>
            <Link to="/products" className="link-with-icon">
              Xem tất cả sản phẩm <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="category-grid">
            {CATEGORY_CARDS.map((item, index) => {
              const destination = `/?category=${item.category}#product-grid`;
              return (
                <Link
                  key={item.title}
                  to={destination}
                  className="category-card reveal-item"
                  style={{ animationDelay: `${index * 0.08}s`, background: item.gradient }}
                >
                  <span className="category-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="category-cta">
                    Khám phá <span aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="benefit-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-badge">Giải pháp toàn diện</span>
              <h2 className="section-title">Điểm khác biệt của EVB Market</h2>
            </div>
          </div>
          <div className="benefit-grid">
            {BENEFIT_CARDS.map((card, index) => (
              <div
                key={card.title}
                className="benefit-card reveal-item"
                style={{ animationDelay: `${index * 0.1}s`, '--accent-color': card.accent }}
              >
                <span className="benefit-icon" aria-hidden="true">
                  {card.icon}
                </span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                {card.points && (
                  <ul className="benefit-list">
                    {card.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="insight-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-badge">Xu hướng mới nhất</span>
              <h2 className="section-title">Thông tin giúp bạn ra quyết định</h2>
              <p className="section-description">
                Cập nhật diễn biến thị trường, gợi ý nhà cung cấp và câu chuyện thực tế từ cộng đồng.
              </p>
            </div>
          </div>
          <div className="insight-grid">
            {INSIGHT_CARDS.map((card, index) => (
              <div
                key={card.title}
                className="insight-card reveal-item"
                style={{ animationDelay: `${index * 0.09}s` }}
              >
                <span className="insight-tag">{card.tag}</span>
                <h3>{card.title}</h3>
                <p>{card.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="product-grid" className="products-section">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-badge">Tin đăng nổi bật</span>
              <h2 className="section-title">Kho sản phẩm mới nhất</h2>
              <p className="section-description">
                Từ pin tái chế đến trạm sạc nhanh – tất cả đều được kiểm duyệt kỹ càng trước khi hiển thị.
              </p>
            </div>
            {!loading && filteredListings.length > 0 && (
              <p className="product-meta">
                Đang hiển thị <strong>{filteredListings.length}</strong> tin phù hợp.
              </p>
            )}
          </div>

          {/* Thanh nav nhỏ: nút "Lọc" để xổ bộ lọc */}
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

          {/* Bộ lọc sản phẩm tương tự Chợ Tốt (Location, Model, Giá) */}
          {(filterOpen || hasActiveFilter) && (
          <div className="filter-bar card">
            <div className="filter-bar-row">
              <div className="filter-field">
                <label className="filter-label" htmlFor="filter-location">
                  Khu vực
                </label>
                <input
                  id="filter-location"
                  name="location"
                  type="text"
                  placeholder="VD: Hà Nội, TP.HCM..."
                  className="form-input filter-input"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-field">
                <label className="filter-label" htmlFor="filter-model">
                  Mẫu xe / Model
                </label>
                <input
                  id="filter-model"
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

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner-simple"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <IconEmptyBox />
              </div>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>
                Hãy thử điều chỉnh từ khóa hoặc lựa chọn danh mục khác. Chúng tôi cập nhật dữ liệu mới mỗi ngày.
              </p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredListings.map((listing, index) => {
                const listingId = listing._id || listing.id;
                const imageUrl = listing.images && listing.images[0];

                return (
                  <Link
                    key={listingId}
                    to={`/products/${listingId}`}
                    className="product-card-modern reveal-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
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

                      {/* ⭐️ THÊM NHÃN "ĐÃ BÁN" NẾU STATUS LÀ 'SOLD' ⭐️ */}
                      {listing.status === 'Sold' && (
                        <div className="product-sold-badge">
                          Đã bán
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      {/* ... (Phần còn lại của code giữ nguyên) ... */}
                      <h3 className="product-title font-semibold text-lg">
                        {listing.title || 'Sản phẩm không tên'}
                      </h3>
                      <p className="product-description text-sm">
                        {/* ... (description) ... */}
                      </p>
                      <p className="product-price text-lg font-bold mt-3">
                        {listing.price ? `${listing.price.toLocaleString('vi-VN')} VND` : 'Liên hệ'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card reveal-item">
            <div className="cta-content">
              <span className="cta-badge">Trở thành người tiên phong</span>
              <h2>Đưa sản phẩm năng lượng xanh của bạn đến đúng người</h2>
              <p>Đăng tin miễn phí, quản lý giao dịch rõ ràng và nhận hỗ trợ từ đội ngũ EVB mọi lúc.</p>
            </div>
            <div className="cta-actions">
              <Link to="/create" className="btn btn-primary cta-primary">
                Đăng tin ngay
              </Link>
              <Link to="/register" className="btn cta-secondary">
                Đăng ký tài khoản
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;