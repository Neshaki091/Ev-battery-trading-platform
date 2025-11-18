import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react'; // MỚI: Thêm useRef
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import MyListingsPage from './pages/MyListingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AuctionsPage from './pages/AuctionsPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import ChatRoomPage from './pages/ChatRoomPage';
import './App.css';
import logo from './assets/Logo_EVB_Light.png';

// MỚI: Thêm icon cho dropdown
const IconChevronDown = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// Icon Messenger/Chat
const IconMessage = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

function Navigation() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // MỚI: State và Ref cho dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Logic useEffect để lấy user (giữ nguyên)
  useEffect(() => {
    const userData = localStorage.getItem('evb_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    const handleStorageChange = () => {
      const userData = localStorage.getItem('evb_user');
      setUser(userData ? JSON.parse(userData) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const userData = localStorage.getItem('evb_user');
      setUser(userData ? JSON.parse(userData) : null);
    }, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // MỚI: Logic để đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentQuery = params.get('q') || '';
    setSearchTerm(currentQuery);
  }, [location.search]);

  const handleLogout = () => {
    localStorage.removeItem('evb_token');
    localStorage.removeItem('evb_user');
    setUser(null);
    setIsDropdownOpen(false); // MỚI: Đóng dropdown khi logout
    navigate('/');
  };
  
  const handleDropdownClick = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedQuery = searchTerm.trim();
    setIsDropdownOpen(false);
    if (trimmedQuery) {
      navigate(`/products?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      navigate('/products');
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-content">
          {/* 1. Logo (nhấn về home) */}
          <Link to="/" className="nav-logo" onClick={() => setIsDropdownOpen(false)}>
            <img src={logo} alt="EVB Logo" className="nav-logo-image" />
          </Link>
          
          <div className="nav-actions">
            <form className="nav-search" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className="nav-search-input"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button type="submit" className="nav-search-button">
                Tìm kiếm
              </button>
            </form>

            {/* 2. Các nút bên phải */}
            <div className="nav-links">
            <Link to="/auctions" className="nav-link">
              Đấu giá
            </Link>
            {user ? (
              // === GIAO DIỆN KHI ĐÃ ĐĂNG NHẬP ===
              <>
                {/* Nút Nhắn tin */}
                <Link 
                  to="/chat" 
                  className="nav-link"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    position: 'relative'
                  }}
                  title="Nhắn tin"
                >
                  <IconMessage />
                  <span>Nhắn tin</span>
                </Link>
                
                {/* Nút Bán hàng (luôn hiển thị) */}
                <Link to="/create" className="nav-link-button">
                  Bán hàng
                </Link>
                
                {/* MỚI: Dropdown thông tin user */}
                <div className="relative" ref={dropdownRef}>
                  {/* Nút bấm tên User */}
                  <button 
                    onClick={() => setIsDropdownOpen(prev => !prev)} 
                    className="nav-user-button"
                  >
                    <span>Chào, {user.username || 'Bạn'}</span>
                    <IconChevronDown />
                  </button>
                  
                  {/* Menu Dropdown */}
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <Link to="/my-listings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        Tin đăng của tôi
                      </Link>
                      <Link to="/wishlist" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        Tin đã thích
                      </Link>
                      <Link to="/cart" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        Giao dịch của tôi
                      </Link>
                      <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                        Thông tin của tôi
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="dropdown-divider"></div>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item-logout"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // === GIAO DIỆN KHI CHƯA ĐĂNG NHẬP ===
              <>
                <Link to="/login" className="nav-link">
                  Đăng nhập
                </Link>
                <Link to="/register" className="nav-link-button">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppLayout() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timeout = window.setTimeout(() => setIsTransitioning(false), 450);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setIsTransitioning(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const timeout = window.setTimeout(() => setIsTransitioning(false), 450);
    return () => window.clearTimeout(timeout);
  }, [location.pathname, location.search]);

  return (
    <div className="app-container">
      <Navigation />
      <main className="page-wrapper">
        <div
          key={`${location.pathname}${location.search}${location.hash}`}
          className={`page-transition ${isTransitioning ? 'page-transition--active' : ''}`}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/create" element={<CreateListingPage />} />
            <Route path="/edit/:id" element={<EditListingPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/auctions" element={<AuctionsPage />} />
            <Route path="/auctions/:id" element={<AuctionDetailPage />} />
            <Route path="/chat" element={<ChatRoomPage />} />
            <Route path="/chat/:roomId" element={<ChatRoomPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;