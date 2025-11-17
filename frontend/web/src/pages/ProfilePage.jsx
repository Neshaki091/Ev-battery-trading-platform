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
      setUser(response.data);
      const profile = response.data.profile || {};
      setProfileForm({
        email: profile.email || '',
        phonenumber: profile.phonenumber || '',
        username: profile.username || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };


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
    </div>
  );
}

export default ProfilePage;

