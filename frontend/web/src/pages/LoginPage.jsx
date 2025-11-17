import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../css/FormPages.css';

const LOGIN_HIGHLIGHTS = [
  'Theo dõi toàn bộ giao dịch và trao đổi với đối tác trong một bảng điều khiển duy nhất.',
  'Gợi ý giá bằng AI giúp định giá sản phẩm trong vài giây dựa trên dữ liệu thị trường mới nhất.',
  'Bảo mật đa tầng và lưu trữ hợp đồng điện tử đảm bảo giao dịch minh bạch, an toàn.'
];

const LOGIN_STATS = [
  { value: '4.8h', label: 'Thời gian duyệt trung bình' },
  { value: '98%', label: 'Khách hàng hài lòng' },
  { value: '1.200+', label: 'Tin đăng đang hoạt động' }
];

const IconSpark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.09 6.26L20 9.27l-5 3.87L16.18 20 12 16.9 7.82 20 9 13.14l-5-3.87 5.91-.91L12 2z" />
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <polyline points="22,4 12,13 2,4" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.29 18.29 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.66 18.66 0 0 1-2.58 3.94" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal-item').forEach((element) => {
        element.classList.add('is-visible');
      });
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/users/login', formData);

      if (response.data.accessToken) {
        localStorage.setItem('evb_token', response.data.accessToken);
      }

      if (response.data.user) {
        const userWithRole = {
          ...response.data.user,
          role: response.data.role,
          isActive: response.data.isActive
        };
        localStorage.setItem('evb_user', JSON.stringify(userWithRole));
      }

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card reveal-item">
          <aside className="auth-card__info">
            <span className="auth-pill">
              <IconSpark />
              EVB Market
            </span>
            <div>
              <h1 className="auth-title">Khởi động phiên giao dịch năng lượng xanh của bạn</h1>
              <p>
                Đăng nhập để quản lý tin đăng, theo dõi người mua &amp; người bán, và khai thác bộ công cụ dữ liệu chuyên sâu dành riêng cho thị trường xe điện và pin.
              </p>
            </div>
            <ul className="auth-highlight-list">
              {LOGIN_HIGHLIGHTS.map((item) => (
                <li key={item}>
                  <span className="auth-highlight-icon">
                    <IconCheck />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="auth-meta-card">
              <span style={{ color: 'rgba(241,245,249,0.8)' }}>Nền tảng ưu tiên trải nghiệm người dùng</span>
              <div className="auth-meta-stats">
                {LOGIN_STATS.map((stat) => (
                  <div key={stat.label} className="auth-meta-stat">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="auth-card__form">
            <div className="auth-heading">
              <span className="auth-badge">Chào mừng quay lại</span>
              <h2>Đăng nhập vào tài khoản EVB</h2>
              <p>Tiếp tục quản lý sản phẩm, theo dõi giao dịch và kết nối đối tác nhanh chóng.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="form-alert form-alert--error">{error}</div>}

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <div className="input-with-icon">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="form-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <span className="input-icon">
                    <IconMail />
                  </span>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="password">Mật khẩu</label>
                <div className="input-with-icon">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span className="input-icon">
                    <IconLock />
                  </span>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <div className="auth-options">
                <span>
                  Quên mật khẩu?{' '}
                  <a href="mailto:support@evb.market">Liên hệ hỗ trợ</a>
                </span>
                <span>Bạn mới tham gia? <Link to="/register">Tạo tài khoản</Link></span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary auth-submit"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <p className="auth-switch">
                Chưa có tài khoản?{' '}
                <Link to="/register">Đăng ký miễn phí ngay</Link>
              </p>

              <div className="auth-safe-note">
                <IconShield />
                <span>EVB áp dụng mã hóa AES-256 và xác thực phiên nâng cao để bảo vệ giao dịch của bạn.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

