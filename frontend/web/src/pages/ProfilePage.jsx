import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Icon Edit
const IconEdit = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

// Icon Close
const IconClose = () => (
  <svg className="icon-svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' hoặc 'password'
  const modalRef = useRef(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    email: '',
    phonenumber: '',
    username: '',
    firstName: '',
    lastName: '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Wallet form state
  const [walletForm, setWalletForm] = useState({
    bankName: '',
    bankCode: '',
    accountNumber: '',
    accountName: '',
    branch: '',
  });
  const [walletError, setWalletError] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);

  // 🆕 Wallet balance & withdrawal states
  const [walletBalance, setWalletBalance] = useState(0);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalNote, setWithdrawalNote] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('evb_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [navigate]);


  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      console.log('📥 Profile response:', response.data);

      setUser(response.data);
      const profile = response.data.profile || {};
      const wallet = response.data.wallet || {};

      console.log('💳 Wallet data:', wallet);

      setProfileForm({
        email: profile.email || '',
        phonenumber: profile.phonenumber || '',
        username: profile.username || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
      });
      setWalletForm({
        bankName: wallet.bankName || '',
        bankCode: wallet.bankCode || '',
        accountNumber: wallet.accountNumber || '',
        accountName: wallet.accountName || '',
        branch: wallet.branch || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      // Đồng bộ với các trang Deposit/Withdrawal: gọi qua auth-service
      const response = await api.get('/auth/wallet/balance');
      setWalletBalance(response.data.walletBalance || 0);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    }
  };

  // 🆕 Fetch withdrawal requests
  const fetchWithdrawalRequests = async () => {
    try {
      // Gọi qua transaction-service
      const response = await api.get('/transactions/withdrawals/my-requests');
      setWithdrawalRequests(response.data.data || []);
    } catch (err) {
      console.error('Error fetching withdrawal requests:', err);
    }
  };

  // 🆕 Handle withdrawal request submission
  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();
    setWithdrawalError('');
    setWithdrawalLoading(true);

    try {
      const amount = parseFloat(withdrawalAmount);

      if (!amount || amount <= 0) {
        setWithdrawalError('Số tiền phải lớn hơn 0');
        return;
      }

      if (amount > walletBalance) {
        setWithdrawalError(`Số dư không đủ. Số dư hiện tại: ${walletBalance.toLocaleString('vi-VN')} đ`);
        return;
      }

      await api.post('/transactions/withdrawals/request', {
        amount: amount,
        note: withdrawalNote
      });

      alert('✅ Yêu cầu rút tiền đã được gửi. Admin sẽ xử lý trong vòng 24h.');
      setIsWithdrawalModalOpen(false);
      setWithdrawalAmount('');
      setWithdrawalNote('');
      fetchWithdrawalRequests();
    } catch (err) {
      setWithdrawalError(err.response?.data?.error || 'Không thể gửi yêu cầu rút tiền');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Fetch wallet data on mount
  useEffect(() => {
    if (user) {
      fetchWalletBalance();
      fetchWithdrawalRequests();
    }
  }, [user]);


  // Đóng modal khi click ra ngoài hoặc nhấn ESC
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    }

    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    }

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('evb_user') || '{}');
      const userId = userData._id || user?.user_id;

      await api.put(`/auth/users/${userId}`, {
        email: profileForm.email,
        phonenumber: profileForm.phonenumber,
        // Username không được gửi vì không thể thay đổi
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
      });

      alert('Cập nhật profile thành công');
      await fetchProfile();
      // Update localStorage user data
      const updatedUser = {
        ...userData,
        profile: {
          ...userData.profile,
          email: profileForm.email,
          phonenumber: profileForm.phonenumber,
          username: profileForm.username,
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
        }
      };
      localStorage.setItem('evb_user', JSON.stringify(updatedUser));
      setIsModalOpen(false); // Đóng modal sau khi cập nhật thành công
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Lỗi khi cập nhật profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('evb_user') || '{}');
      const userId = userData._id || userData.user_id || user?.user_id;

      await api.post(`/auth/users/${userId}/change-password`, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      alert('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      localStorage.removeItem('evb_token');
      localStorage.removeItem('evb_user');
      navigate('/login');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateWallet = async (e) => {
    e.preventDefault();

    // Confirmation dialog để user kiểm tra lại
    const confirmMessage = `Vui lòng xác nhận thông tin ví:\n\n` +
      `Ngân hàng: ${walletForm.bankName}\n` +
      `Mã NH: ${walletForm.bankCode}\n` +
      `Số TK: ${walletForm.accountNumber}\n` +
      `Tên TK: ${walletForm.accountName}\n` +
      `Chi nhánh: ${walletForm.branch || 'Không có'}\n\n` +
      `⚠️ KIỂM TRA KỞ SỐ TÀI KHOẢN!\n` +
      `Bạn có chắc chắn thông tin trên là chính xác?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setWalletError('');
    setWalletLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('evb_user') || '{}');
      const userId = userData._id || user?.user_id;

      await api.put(`/auth/users/${userId}`, {
        wallet: walletForm
      });

      // Refresh profile để lấy dữ liệu mới
      await fetchProfile();

      // Đóng modal
      setIsModalOpen(false);

      alert('✅ Cập nhật thông tin ví thành công!\n\nThông tin ví của bạn đã được lưu và sẽ dùng để nhận tiền từ giao dịch.');
    } catch (err) {
      setWalletError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin ví');
    } finally {
      setWalletLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container text-center py-20">
        <div className="loading-spinner-simple"></div>
        <p className="text-xl mt-4" style={{ color: 'var(--text-body)' }}>Đang tải profile...</p>
      </div>
    );
  }

  const userData = JSON.parse(localStorage.getItem('evb_user') || '{}');
  const profile = user?.profile || {};

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      <div className="container py-8">
        <div className="grid grid-1" style={{ maxWidth: '900px', margin: '0 auto', gap: '1.5rem' }}>
          {/* Thông tin cá nhân */}
          <div className="card p-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>Thông tin cá nhân</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-secondary"
                style={{
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 'auto'
                }}
                title="Chỉnh sửa thông tin"
              >
                <IconEdit />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>ID:</strong> {user?.user_id || userData._id || '—'}</p>
              <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>Họ:</strong> {profile.firstName || '—'}</p>
              <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>Tên:</strong> {profile.lastName || '—'}</p>
              <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>Email:</strong> {profile.email || '—'}</p>
              <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>Phone:</strong> {profile.phonenumber || '—'}</p>
              <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>Username:</strong> {profile.username || '—'}</p>
              <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>Role:</strong> {userData.role || 'user'}</p>
              <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>Tình trạng:</strong> {userData.isActive === false ? '❌ Deactivated' : '✅ Active'}</p>
            </div>
          </div>

          {/* 🆕 Số dư ví */}
          <div className="card p-6" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 className="text-2xl font-bold" style={{ color: 'white', marginBottom: '0.5rem' }}>💰 Số dư ví</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>Tiền nhận được từ các giao dịch bán hàng</p>
            </div>

            <div style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {walletBalance.toLocaleString('vi-VN')} đ
            </div>

            <button
              onClick={() => {
                if (!walletForm.bankName || !walletForm.accountNumber) {
                  alert('⚠️ Vui lòng cập nhật thông tin ngân hàng trước khi rút tiền!');
                  setIsModalOpen(true);
                  setActiveTab('wallet');
                  return;
                }
                setIsWithdrawalModalOpen(true);
              }}
              className="btn"
              style={{
                background: 'white',
                color: '#667eea',
                padding: '0.75rem 1.5rem',
                fontWeight: 'bold',
                width: '100%',
                border: 'none'
              }}
              disabled={walletBalance <= 0}
            >
              {walletBalance <= 0 ? '💸 Chưa có tiền để rút' : '💸 Yêu cầu rút tiền'}
            </button>

            {/* Withdrawal requests list */}
            {withdrawalRequests.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
                  📋 Lịch sử yêu cầu rút tiền
                </h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {withdrawalRequests.map((request) => {
                    const statusColors = {
                      pending: { bg: '#ffc107', text: '#000' },
                      completed: { bg: '#28a745', text: '#fff' },
                      rejected: { bg: '#dc3545', text: '#fff' }
                    };
                    const statusLabels = {
                      pending: '⏳ Chờ duyệt',
                      completed: '✅ Đã chuyển',
                      rejected: '❌ Từ chối'
                    };
                    const color = statusColors[request.status] || statusColors.pending;

                    return (
                      <div
                        key={request._id}
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          padding: '1rem',
                          borderRadius: '8px',
                          marginBottom: '0.75rem',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {request.amount.toLocaleString('vi-VN')} đ
                          </span>
                          <span
                            style={{
                              background: color.bg,
                              color: color.text,
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {statusLabels[request.status]}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>
                          <div>Ngày tạo: {new Date(request.createdAt).toLocaleString('vi-VN')}</div>
                          {request.processedAt && (
                            <div>Xử lý: {new Date(request.processedAt).toLocaleString('vi-VN')}</div>
                          )}
                          {request.note && <div>Ghi chú: {request.note}</div>}
                          {request.adminNote && <div>Admin: {request.adminNote}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Thông tin ví */}
          <div className="card p-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>💳 Thông tin ví</h2>
              <button
                onClick={() => { setIsModalOpen(true); setActiveTab('wallet'); }}
                className="btn btn-secondary"
                style={{
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 'auto'
                }}
                title="Chỉnh sửa thông tin ví"
              >
                <IconEdit />
              </button>
            </div>
            {(() => {
              const wallet = user?.wallet || {};
              const hasWallet = wallet.bankName || wallet.accountNumber || wallet.accountName;

              console.log('🔍 Wallet check:', { wallet, hasWallet });

              return hasWallet ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: '#d4edda', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                    <p style={{ color: '#155724', margin: 0 }}>✅ <strong>Đã cập nhật thông tin ví</strong></p>
                  </div>
                  <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>Ngân hàng:</strong> {wallet.bankName || '—'}</p>
                  <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>Mã ngân hàng:</strong> {wallet.bankCode || '—'}</p>
                  <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>Số tài khoản:</strong> {wallet.accountNumber || '—'}</p>
                  <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>Tên chủ TK:</strong> {wallet.accountName || '—'}</p>
                  {wallet.branch && <p style={{ color: 'var(--text-body)' }}><strong style={{ color: 'var(--text-heading)' }}>Chi nhánh:</strong> {wallet.branch}</p>}
                </div>
              ) : (
                <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: 'var(--radius-md)', color: '#856404' }}>
                  <p style={{ marginBottom: '0.5rem' }}>⚠️ <strong>Bạn chưa cập nhật thông tin ví</strong></p>
                  <p style={{ fontSize: '0.875rem' }}>Vui lòng cập nhật thông tin tài khoản ngân hàng để nhận tiền từ giao dịch bán hàng.</p>
                </div>
              );
            })()}
          </div>

        </div>
      </div>

      {/* Modal/Popup */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div
            ref={modalRef}
            className="card"
            style={{
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-body)',
                borderRadius: 'var(--radius-md)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-muted)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              title="Đóng"
            >
              <IconClose />
            </button>

            <div className="p-6">
              {/* Tab Buttons */}
              <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={activeTab === 'profile' ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{
                      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                      borderBottom: activeTab === 'profile' ? '2px solid var(--color-primary)' : '2px solid transparent',
                      marginBottom: '-1px'
                    }}
                  >
                    Chỉnh sửa thông tin
                  </button>
                  <button
                    onClick={() => setActiveTab('wallet')}
                    className={activeTab === 'wallet' ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{
                      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                      borderBottom: activeTab === 'wallet' ? '2px solid var(--color-primary)' : '2px solid transparent',
                      marginBottom: '-1px'
                    }}
                  >
                    💳 Thông tin ví
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={activeTab === 'password' ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{
                      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                      borderBottom: activeTab === 'password' ? '2px solid var(--color-primary)' : '2px solid transparent',
                      marginBottom: '-1px'
                    }}
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>Cập nhật thông tin</h3>
                  {profileError && <div className="error-message mb-4">{profileError}</div>}
                  <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="Email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số điện thoại</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="Số điện thoại"
                        value={profileForm.phonenumber}
                        onChange={(e) => setProfileForm({ ...profileForm, phonenumber: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Họ</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Họ"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tên</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Tên"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tên đăng nhập (Username)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Tên đăng nhập"
                        value={profileForm.username}
                        disabled
                        readOnly
                        style={{
                          backgroundColor: 'var(--bg-muted)',
                          cursor: 'not-allowed',
                          opacity: 0.7
                        }}
                        title="Username không thể thay đổi (tự động từ email)"
                      />
                      <small style={{ color: 'var(--text-body)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Username không thể thay đổi. Nó được tự động tạo từ email của bạn.
                      </small>
                    </div>
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="btn btn-primary btn-full"
                      style={{ opacity: profileLoading ? 0.5 : 1, cursor: profileLoading ? 'not-allowed' : 'pointer' }}
                    >
                      {profileLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'wallet' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>💳 Cập nhật thông tin ví</h3>
                  <div style={{ padding: '1rem', background: '#d1ecf1', borderRadius: 'var(--radius-md)', marginBottom: '1rem', color: '#0c5460', fontSize: '0.875rem' }}>
                    <p style={{ marginBottom: '0.5rem' }}><strong>ℹ️ Lưu ý quan trọng:</strong></p>
                    <ul style={{ marginLeft: '1.5rem', marginBottom: 0 }}>
                      <li>Tên chủ tài khoản phải viết HOA, KHÔNG DẤU</li>
                      <li>Kiểm tra kỹ số tài khoản trước khi lưu</li>
                      <li>Thông tin này dùng để nhận tiền từ giao dịch bán hàng</li>
                    </ul>
                  </div>
                  {walletError && <div className="error-message mb-4">{walletError}</div>}
                  <form onSubmit={handleUpdateWallet}>
                    <div className="form-group">
                      <label className="form-label">Tên ngân hàng *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ví dụ: Ngân hàng TMCP Ngoại thương Việt Nam"
                        value={walletForm.bankName}
                        onChange={(e) => setWalletForm({ ...walletForm, bankName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mã ngân hàng *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ví dụ: VCB, TCB, ACB"
                        value={walletForm.bankCode}
                        onChange={(e) => setWalletForm({ ...walletForm, bankCode: e.target.value.toUpperCase() })}
                        required
                      />
                      <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        VCB: Vietcombank, TCB: Techcombank, ACB: ACB, VPB: VPBank, MB: MBBank
                      </small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số tài khoản *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Số tài khoản ngân hàng"
                        value={walletForm.accountNumber}
                        onChange={(e) => setWalletForm({ ...walletForm, accountNumber: e.target.value })}
                        required
                      />
                      <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: '500' }}>
                        ⚠️ KIỂM TRA KỞ SỐ TÀI KHOẢN! Nhập sai sẽ không nhận được tiền.
                      </small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tên chủ tài khoản *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="NGUYEN VAN A (VIẾT HOA, KHÔNG DẤU)"
                        value={walletForm.accountName}
                        onChange={(e) => setWalletForm({ ...walletForm, accountName: e.target.value.toUpperCase() })}
                        required
                      />
                      <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Phải khớp với tên trên thẻ ngân hàng (VIẾT HOA, KHÔNG DẤU)
                      </small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Chi nhánh (tùy chọn)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ví dụ: Chi nhánh Hà Nội"
                        value={walletForm.branch}
                        onChange={(e) => setWalletForm({ ...walletForm, branch: e.target.value })}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={walletLoading}
                      className="btn btn-primary btn-full"
                      style={{ opacity: walletLoading ? 0.5 : 1, cursor: walletLoading ? 'not-allowed' : 'pointer' }}
                    >
                      {walletLoading ? 'Đang cập nhật...' : 'Lưu thông tin ví'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>Đổi mật khẩu</h3>
                  {passwordError && <div className="error-message mb-4">{passwordError}</div>}
                  <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                      <label className="form-label">Mật khẩu cũ</label>
                      <input
                        type="password"
                        required
                        className="form-input"
                        placeholder="Mật khẩu cũ"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mật khẩu mới</label>
                      <input
                        type="password"
                        required
                        className="form-input"
                        placeholder="Mật khẩu mới"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="btn btn-primary btn-full"
                      style={{ opacity: passwordLoading ? 0.5 : 1, cursor: passwordLoading ? 'not-allowed' : 'pointer' }}
                    >
                      {passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Withdrawal Request Modal */}
      {isWithdrawalModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsWithdrawalModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            className="modal-content card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
                💸 Yêu cầu rút tiền
              </h2>
              <button
                onClick={() => setIsWithdrawalModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-body)'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              background: 'var(--bg-muted)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Số dư hiện tại:
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                {walletBalance.toLocaleString('vi-VN')} đ
              </div>
            </div>

            <form onSubmit={handleWithdrawalRequest}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  Số tiền muốn rút (VND) <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="Nhập số tiền"
                  min="0"
                  max={walletBalance}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Tối đa: {walletBalance.toLocaleString('vi-VN')} đ
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  className="form-input"
                  value={withdrawalNote}
                  onChange={(e) => setWithdrawalNote(e.target.value)}
                  placeholder="Ghi chú thêm cho admin..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {withdrawalError && (
                <div style={{
                  background: '#f8d7da',
                  color: '#721c24',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  {withdrawalError}
                </div>
              )}

              <div style={{
                background: '#d1ecf1',
                color: '#0c5460',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                fontSize: '0.875rem'
              }}>
                <strong>ℹ️ Lưu ý:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li>Admin sẽ xử lý yêu cầu trong vòng 24h</li>
                  <li>Tiền sẽ được chuyển vào tài khoản: <strong>{walletForm.accountNumber}</strong></li>
                  <li>Ngân hàng: <strong>{walletForm.bankName}</strong></li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsWithdrawalModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  disabled={withdrawalLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={withdrawalLoading}
                >
                  {withdrawalLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;

