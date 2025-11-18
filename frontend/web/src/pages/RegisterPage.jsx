import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../css/FormPages.css';

const REGISTER_BENEFITS = [
  {
    title: 'Tiếp cận đúng đối tác',
    description: 'Thuật toán gợi ý kết nối nguồn hàng phù hợp với quy mô doanh nghiệp và khu vực hoạt động.',
    icon: '🤝'
  },
  {
    title: 'Quản lý giao dịch thông minh',
    description: 'Theo dõi trạng thái, lịch sử thanh toán, và các biên bản kiểm định ngay trong dashboard.',
    icon: '📊'
  },
  {
    title: 'Đội ngũ EVB đồng hành',
    description: 'Được hỗ trợ 1-1 trong suốt quá trình đăng tin, đàm phán và bàn giao sản phẩm.',
    icon: '🎧'
  }
];

const REGISTER_STATS = [
  { value: '5 phút', label: 'Hoàn tất đăng ký & xác minh' },
  { value: '320+', label: 'Doanh nghiệp đang giao dịch' },
  { value: '99.2%', label: 'Tỷ lệ giao dịch thành công' }
];

const PASSWORD_TIPS = [
  'Sử dụng tối thiểu 8 ký tự gồm chữ hoa, chữ thường và số.',
  'Tránh sử dụng lại mật khẩu đã từng dùng ở nền tảng khác.',
  'Thêm ký tự đặc biệt để bảo vệ tài khoản tốt hơn.'
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

const IconPhone = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 5.18 2 2 0 0 1 5 3h4.09a1 1 0 0 1 1 .75 12.05 12.05 0 0 0 .7 2.38 1 1 0 0 1-.23 1l-1.27 1.27a16 16 0 0 0 6.86 6.86l1.27-1.27a1 1 0 0 1 1-.23 12.05 12.05 0 0 0 2.38.7 1 1 0 0 1 .75 1Z" />
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

const IconUserPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
    <path d="M19 8v6" />
    <path d="M22 11h-6" />
  </svg>
);

function passwordStrengthLevel(password) {
  if (!password) return 'weak';
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score >= 4) return 'strong';
  if (score >= 2) return 'medium';
  return 'weak';
}

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    phonenumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal-item').forEach((element) => {
        element.classList.add('is-visible');
      });
    });
  }, []);

  const passwordStrength = useMemo(
    () => passwordStrengthLevel(formData.password),
    [formData.password]
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/users', {
        email: formData.email,
        phonenumber: formData.phonenumber,
        password: formData.password,
      });

      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
              Trở thành đối tác
            </span>
            <div>
              <h1 className="auth-title">Tham gia cộng đồng giao dịch năng lượng xanh hàng đầu</h1>
              <p>
                Đăng ký miễn phí để đăng tin bán, đặt mua sản phẩm đạt chuẩn kiểm định và nhận báo giá nhanh từ các nhà cung cấp uy tín trên toàn quốc.
              </p>
            </div>
            <div className="auth-meta-card">
              <span style={{ color: 'rgba(241,245,249,0.82)' }}>Quy trình đăng ký gồm 3 bước:</span>
              <div className="auth-meta-stats">
                {REGISTER_STATS.map((stat) => (
                  <div key={stat.label} className="auth-meta-stat">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ul className="auth-highlight-list">
              {REGISTER_BENEFITS.map((benefit) => (
                <li key={benefit.title}>
                  <span className="auth-highlight-icon" aria-hidden="true">
                    {benefit.icon}
                  </span>
                  <span>
                    <strong style={{ display: 'block', color: '#fff' }}>{benefit.title}</strong>
                    {benefit.description}
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="auth-card__form">
            <div className="auth-heading">
              <span className="auth-badge">Đăng ký thành viên</span>
              <h2>Tạo tài khoản EVB mới</h2>
              <p>Hoàn tất thông tin để kích hoạt bảng điều khiển quản lý giao dịch của bạn.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="form-alert form-alert--error">{error}</div>}

              <div className="form-field">
                <label htmlFor="email">Email công việc</label>
                <div className="input-with-icon">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="form-input"
                    placeholder="ban@doanhnghiep.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <span className="input-icon">
                    <IconMail />
                  </span>
                </div>
                <p className="form-hint">Sử dụng email doanh nghiệp giúp xác minh tài khoản nhanh hơn.</p>
              </div>

              <div className="form-field">
                <label htmlFor="phonenumber">Số điện thoại</label>
                <div className="input-with-icon">
                  <input
                    id="phonenumber"
                    name="phonenumber"
                    type="tel"
                    required
                    className="form-input"
                    placeholder="(+84) 912 345 678"
                    value={formData.phonenumber}
                    onChange={handleChange}
                  />
                  <span className="input-icon">
                    <IconPhone />
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
                    autoComplete="new-password"
                    required
                    className="form-input"
                    placeholder="Ít nhất 8 ký tự"
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
                <div className="form-inline-actions">
                  <span className={`badge ${passwordStrength === 'strong' ? 'badge--approved' : passwordStrength === 'medium' ? 'badge--pending' : 'badge--hidden'}`}>
                    {passwordStrength === 'strong' ? 'Mạnh' : passwordStrength === 'medium' ? 'Trung bình' : 'Yếu'}
                  </span>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <div className="input-with-icon">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="form-input"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <span className="input-icon">
                    <IconLock />
                  </span>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <div className="auth-safe-note">
                <IconShield />
                <span>
                  EVB sử dụng mã hóa AES-256 cho toàn bộ dữ liệu đăng ký. Chúng tôi không bao giờ chia sẻ thông tin liên hệ của bạn với bên thứ ba.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary auth-submit"
              >
                <IconUserPlus />
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
              </button>

              <p className="auth-switch">
                Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
              </p>

              <div className="form-alert form-alert--success" style={{ opacity: 0.95 }}>
                <strong>Mẹo bảo mật:</strong>
                <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem' }}>
                  {PASSWORD_TIPS.map((tip) => (
                    <li key={tip} style={{ marginBottom: '0.35rem' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

