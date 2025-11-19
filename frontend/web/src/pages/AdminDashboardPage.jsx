import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('evb_user') || '{}');
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [navigate]);

  const [toast, setToast] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [isConfirmProcessing, setIsConfirmProcessing] = useState(false);

  const showToast = useCallback((message, variant = 'info') => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const openConfirm = useCallback((config) => {
    setConfirmConfig(config);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmConfig(null);
    setIsConfirmProcessing(false);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!confirmConfig?.onConfirm) {
      closeConfirm();
      return;
    }
    try {
      setIsConfirmProcessing(true);
      await confirmConfig.onConfirm();
    } catch (error) {
      console.error(error);
    } finally {
      closeConfirm();
    }
  }, [confirmConfig, closeConfirm]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      <div className="admin-wrapper py-8">
        <div className="admin-surface">
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-heading)' }}>
            🛡️ Admin Dashboard
          </h2>

          <div className="admin-dashboard">
            <aside className="admin-sidebar">
              <div className="admin-sidebar-header">
                <span className="admin-sidebar-title">Danh mục</span>
              </div>
              <nav className="admin-nav">
                <button
                  className={`admin-nav-button ${activeTab === 'listings' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('listings')}
                >
                  Tin chờ duyệt
                </button>
                <button
                  className={`admin-nav-button ${activeTab === 'reports' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('reports')}
                >
                  Báo cáo
                </button>
                <button
                  className={`admin-nav-button ${activeTab === 'fees' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('fees')}
                >
                  Quản lý Phí
                </button>
                <button
                  className={`admin-nav-button ${activeTab === 'analytics' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('analytics')}
                >
                  Analytics
                </button>
                <button
                  className={`admin-nav-button ${activeTab === 'users' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  Users
                </button>
              </nav>
            </aside>

            <div className="admin-content">
              <div key={activeTab} className="admin-tab-panel">
                {activeTab === 'listings' && (
                  <AdminListingsTab onToast={showToast} onConfirm={openConfirm} />
                )}
                {activeTab === 'reports' && (
                  <AdminReportsTab onToast={showToast} onConfirm={openConfirm} />
                )}
                {activeTab === 'fees' && (
                  <AdminFeesTab onToast={showToast} onConfirm={openConfirm} />
                )}
                {activeTab === 'analytics' && (
                  <AdminAnalyticsTab onToast={showToast} />
                )}
                {activeTab === 'users' && (
                  <AdminUsersTab onToast={showToast} onConfirm={openConfirm} />
                )}
              </div>
            </div>
          </div>

          {toast && (
            <div className={`admin-toast admin-toast--${toast.variant}`}>
              <span>{toast.message}</span>
              <button
                type="button"
                className="admin-toast-close"
                onClick={() => setToast(null)}
                aria-label="Đóng thông báo"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
      {confirmConfig && (
        <ConfirmDialog
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          confirmVariant={confirmConfig.confirmVariant}
          onCancel={closeConfirm}
          onConfirm={handleConfirmAction}
          loading={isConfirmProcessing}
        />
      )}
    </div>
  );
}

function AdminListingsTab({ onToast, onConfirm }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/listings/?limit=50');
      setListings(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
      onToast?.('Không thể tải danh sách tin đăng', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleApprove = useCallback(async (id) => {
    try {
      await api.put(`/listings/${id}/approve`);
      onToast?.('Đã duyệt tin đăng thành công', 'success');
      fetchListings();
    } catch (err) {
      console.error(err);
      onToast?.(`Lỗi duyệt tin: ${err.response?.data?.message || err.message}`, 'error');
    }
  }, [fetchListings, onToast]);

  const handleVerify = useCallback((id, currentState) => {
    const nextState = !currentState;
    onConfirm?.({
      title: nextState ? 'Gắn nhãn Kiểm định' : 'Gỡ nhãn Kiểm định',
      message: nextState
        ? 'Xác nhận đánh dấu tin đăng này là đã được kiểm định?'
        : 'Bạn có chắc chắn muốn gỡ nhãn kiểm định khỏi tin đăng này?',
      confirmText: nextState ? 'Xác nhận' : 'Gỡ nhãn',
      confirmVariant: nextState ? 'success' : 'warning',
      onConfirm: async () => {
        try {
          await api.put(`/listings/${id}/verify`, { isVerified: nextState });
          onToast?.('Đã cập nhật trạng thái kiểm định', 'success');
          await fetchListings();
        } catch (err) {
          console.error(err);
          onToast?.(`Không thể cập nhật: ${err.response?.data?.message || err.message}`, 'error');
        }
      },
    });
  }, [fetchListings, onConfirm, onToast]);

  const handleHide = useCallback((id) => {
    onConfirm?.({
      title: 'Ẩn tin đăng',
      message: 'Tin đăng sẽ không còn hiển thị với người dùng. Bạn có chắc chắn?',
      confirmText: 'Ẩn tin',
      confirmVariant: 'warning',
      onConfirm: async () => {
        try {
          await api.put(`/listings/${id}`, { status: 'Hidden' });
          onToast?.('Tin đăng đã được ẩn', 'success');
          await fetchListings();
        } catch (err) {
          console.error(err);
          onToast?.(`Không thể ẩn tin: ${err.response?.data?.message || err.message}`, 'error');
        }
      },
    });
  }, [fetchListings, onConfirm, onToast]);

  const handleDelete = useCallback((id) => {
    onConfirm?.({
      title: 'Xóa tin đăng',
      message: 'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa vĩnh viễn?',
      confirmText: 'Xóa',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/listings/${id}`);
          onToast?.('Đã xóa tin đăng', 'success');
          await fetchListings();
        } catch (err) {
          console.error(err);
          onToast?.(`Xóa thất bại: ${err.response?.data?.message || err.message}`, 'error');
        }
      },
    });
  }, [fetchListings, onConfirm, onToast]);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="loading-spinner-simple"></div>
        <p>Đang tải dữ liệu tin đăng...</p>
      </div>
    );
  }

  return (
    <section className="admin-section">
      <header className="admin-section-header">
        <div>
          <h3 className="admin-section-title">Quản lý Tin đăng ({listings.length})</h3>
          <p className="admin-section-subtitle">
            Theo dõi, phê duyệt và gắn nhãn kiểm định cho các tin đăng mới nhất.
          </p>
        </div>
        <button type="button" className="admin-refresh-button" onClick={fetchListings}>
          ↻ Tải lại
        </button>
      </header>

      <div className="admin-item-grid">
        {listings.map((listing, index) => {
          const listingId = listing._id || listing.id;
          const priceLabel = listing.price ? `${listing.price.toLocaleString('vi-VN')} VND` : 'Liên hệ';
          const status = listing.status || 'Unknown';
          const statusVariant = status.toLowerCase();

          return (
            <div
              key={listingId}
              className="admin-item-card"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <div className="admin-item-header">
                <div>
                  <h4 className="admin-item-title">{listing.title || 'Tin đăng không tên'}</h4>
                  <p className="admin-item-subtitle">
                    {priceLabel} · ID: {listingId}
                  </p>
                </div>
                <span className={`admin-status-badge admin-status-${statusVariant}`}>
                  {status}
                </span>
              </div>

              <div className="admin-item-meta">
                <span className={`admin-verify-indicator ${listing.isVerified ? 'is-verified' : ''}`}>
                  {listing.isVerified ? 'Đã kiểm định' : 'Chưa kiểm định'}
                </span>
                {listing.updatedAt && (
                  <span>
                    Cập nhật: {new Date(listing.updatedAt).toLocaleString('vi-VN')}
                  </span>
                )}
              </div>

              <div className="admin-button-row">
                {status === 'Pending' ? (
                  <button
                    onClick={() => handleApprove(listingId)}
                    className="admin-action-button admin-action-primary"
                  >
                    ✅ Duyệt
                  </button>
                ) : (
                  <button
                    onClick={() => handleHide(listingId)}
                    className="admin-action-button admin-action-warning"
                  >
                    Ẩn tin
                  </button>
                )}
                <button
                  onClick={() => handleVerify(listingId, listing.isVerified)}
                  className={`admin-action-button ${listing.isVerified ? 'admin-action-ghost' : 'admin-action-secondary'}`}
                >
                  {listing.isVerified ? 'Gỡ Verified' : 'Đánh dấu Verified'}
                </button>
                <a
                  href={`/products/${listingId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-action-button admin-action-ghost"
                >
                  👁️ Xem
                </a>
                <button
                  onClick={() => handleDelete(listingId)}
                  className="admin-action-button admin-action-danger"
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AdminReportsTab({ onToast, onConfirm }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/');
      setReports(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      onToast?.('Không thể tải danh sách báo cáo', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = useCallback((id, status) => {
    const isResolve = status === 'RESOLVED';
    onConfirm?.({
      title: isResolve ? 'Đánh dấu báo cáo đã xử lý' : 'Từ chối báo cáo',
      message: isResolve
        ? 'Bạn xác nhận đã xử lý báo cáo này và thông báo tới người dùng?'
        : 'Bạn chắc chắn muốn từ chối báo cáo này?',
      confirmText: isResolve ? 'Đã xử lý' : 'Từ chối',
      confirmVariant: isResolve ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          await api.put(`/reports/${id}/status`, { status });
          onToast?.('Đã cập nhật trạng thái báo cáo', 'success');
          await fetchReports();
        } catch (err) {
          console.error(err);
          onToast?.(`Không thể cập nhật: ${err.response?.data?.message || err.message}`, 'error');
        }
      },
    });
  }, [fetchReports, onConfirm, onToast]);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="loading-spinner-simple"></div>
        <p>Đang tải báo cáo người dùng...</p>
      </div>
    );
  }

  return (
    <section className="admin-section">
      <header className="admin-section-header">
        <div>
          <h3 className="admin-section-title">Báo cáo Người dùng ({reports.length})</h3>
          <p className="admin-section-subtitle">
            Kiểm duyệt và phản hồi kịp thời các báo cáo từ cộng đồng người dùng.
          </p>
        </div>
        <button type="button" className="admin-refresh-button" onClick={fetchReports}>
          ↻ Tải lại
        </button>
      </header>

      {reports.length === 0 ? (
        <div className="admin-empty-state">
          <span className="admin-empty-icon">🎉</span>
          <p>Không có báo cáo nào cần xử lý.</p>
        </div>
      ) : (
        <div className="admin-item-grid">
          {reports.map((report, index) => {
            const reportId = report._id || report.id;
            const status = report.status || 'PENDING';
            const statusVariant = status.toLowerCase();
            const isPending = status === 'PENDING';

            return (
              <div
                key={reportId}
                className="admin-item-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="admin-item-header">
                  <div>
                    <h4 className="admin-item-title">
                      {report.subjectType} · {report.reasonCode}
                    </h4>
                    <p className="admin-item-subtitle">
                      Đối tượng: {report.subjectId} · Mã báo cáo: {reportId}
                    </p>
                  </div>
                  <span className={`admin-status-badge admin-status-${statusVariant}`}>
                    {status}
                  </span>
                </div>

                <div className="admin-item-meta">
                  <span>{report.details || 'Không có mô tả chi tiết.'}</span>
                  {report.createdAt && (
                    <span>Gửi lúc: {new Date(report.createdAt).toLocaleString('vi-VN')}</span>
                  )}
                </div>

                <div className="admin-button-row">
                  <button
                    onClick={() => handleResolve(reportId, 'RESOLVED')}
                    className="admin-action-button admin-action-primary"
                    disabled={!isPending}
                  >
                    ✅ Đã xử lý
                  </button>
                  <button
                    onClick={() => handleResolve(reportId, 'REJECTED')}
                    className="admin-action-button admin-action-danger"
                    disabled={!isPending}
                  >
                    ❌ Từ chối
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AdminFeesTab({ onToast, onConfirm }) {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ type: '', rate: '' });
  const [feeDrafts, setFeeDrafts] = useState({});

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/transactions/fees/');
      const data = response.data?.data || [];
      setFees(data);
      setFeeDrafts(
        data.reduce((acc, fee) => {
          const feeId = fee._id || fee.id;
          acc[feeId] = fee.rate.toString();
          return acc;
        }, {})
      );
    } catch (err) {
      console.error('Error fetching fees:', err);
      onToast?.('Không thể tải cấu hình phí', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handleCreateFee = useCallback(
    async (e) => {
      e.preventDefault();
      const parsedRate = parseFloat(formData.rate);
      if (Number.isNaN(parsedRate) || parsedRate < 0 || parsedRate > 1) {
        onToast?.('Vui lòng nhập tỷ lệ hợp lệ (0 - 1).', 'warning');
        return;
      }
      try {
        await api.post('/admin/transactions/fees/', {
          type: formData.type.toUpperCase(),
          rate: parsedRate,
        });
        onToast?.('Cấu hình phí đã được lưu thành công', 'success');
        setFormData({ type: '', rate: '' });
        fetchFees();
      } catch (err) {
        console.error(err);
        onToast?.(`Không thể lưu cấu hình: ${err.response?.data?.message || err.message}`, 'error');
      }
    },
    [fetchFees, formData.rate, formData.type, onToast]
  );

  const handleDraftChange = useCallback((feeId, value) => {
    setFeeDrafts((prev) => ({ ...prev, [feeId]: value }));
  }, []);

  const handleUpdateFee = useCallback(
    async (id) => {
      const parsedRate = parseFloat(feeDrafts[id]);
      if (Number.isNaN(parsedRate) || parsedRate < 0 || parsedRate > 1) {
        onToast?.('Tỷ lệ phải nằm trong khoảng 0 - 1 (ví dụ 0.05 cho 5%).', 'warning');
        return;
      }
      try {
        await api.put(`/admin/transactions/fees/${id}`, { rate: parsedRate });
        onToast?.('Đã cập nhật tỷ lệ phí', 'success');
        fetchFees();
      } catch (err) {
        console.error(err);
        onToast?.(`Không thể cập nhật: ${err.response?.data?.message || err.message}`, 'error');
      }
    },
    [feeDrafts, fetchFees, onToast]
  );

  const handleDeleteFee = useCallback(
    (id) => {
      onConfirm?.({
        title: 'Xóa cấu hình phí',
        message: 'Bạn có chắc chắn muốn xóa cấu hình phí này? Hành động không thể hoàn tác.',
        confirmText: 'Xóa',
        confirmVariant: 'danger',
        onConfirm: async () => {
          try {
            await api.delete(`/admin/transactions/fees/${id}`);
            onToast?.('Đã xóa cấu hình phí', 'success');
            await fetchFees();
          } catch (err) {
            console.error(err);
            onToast?.(`Không thể xóa: ${err.response?.data?.message || err.message}`, 'error');
          }
        },
      });
    },
    [fetchFees, onConfirm, onToast]
  );

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="loading-spinner-simple"></div>
        <p>Đang tải cấu hình phí...</p>
      </div>
    );
  }

  return (
    <section className="admin-section">
      <header className="admin-section-header">
        <div>
          <h3 className="admin-section-title">Quản lý Phí Hoa Hồng ({fees.length})</h3>
          <p className="admin-section-subtitle">
            Tùy chỉnh mức phí theo danh mục để tối ưu doanh thu và trải nghiệm người dùng.
          </p>
        </div>
        <button type="button" className="admin-refresh-button" onClick={fetchFees}>
          ↻ Tải lại
        </button>
      </header>

      <div className="admin-item-grid">
        {fees.map((fee, index) => {
          const feeId = fee._id || fee.id;
          const draftValue = feeDrafts[feeId] ?? fee.rate.toString();
          return (
            <div
              key={feeId}
              className="admin-item-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="admin-item-header">
                <div>
                  <h4 className="admin-item-title">{fee.type}</h4>
                  <p className="admin-item-subtitle">
                    ID: {feeId} · Hiện tại: {(fee.rate * 100).toFixed(2)}%
                  </p>
                </div>
                <span className={`admin-status-badge ${fee.isActive ? 'admin-status-active' : 'admin-status-hidden'}`}>
                  {fee.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="admin-inline-form">
                <label className="admin-input-label" htmlFor={`fee-${feeId}`}>
                  Điều chỉnh tỷ lệ (0 - 1)
                </label>
                <div className="admin-input-group">
                  <input
                    id={`fee-${feeId}`}
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={draftValue}
                    onChange={(e) => handleDraftChange(feeId, e.target.value)}
                    className="admin-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateFee(feeId)}
                    className="admin-action-button admin-action-primary"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFee(feeId)}
                    className="admin-action-button admin-action-danger"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-divider" />

      <h4 className="admin-form-title">Tạo cấu hình phí mới</h4>
      <form onSubmit={handleCreateFee} className="admin-form-grid">
        <div className="admin-form-field">
          <label className="admin-input-label" htmlFor="fee-type">
            Loại phí
          </label>
          <input
            id="fee-type"
            name="type"
            required
            className="admin-input"
            placeholder="Ví dụ: VEHICLE, DEFAULT"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />
        </div>
        <div className="admin-form-field">
          <label className="admin-input-label" htmlFor="fee-rate">
            Tỷ lệ (0 - 1)
          </label>
          <input
            id="fee-rate"
            name="rate"
            type="number"
            step="0.01"
            min="0"
            max="1"
            required
            className="admin-input"
            placeholder="Ví dụ: 0.05 = 5%"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
          />
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="admin-action-button admin-action-primary full-width">
            Lưu cấu hình
          </button>
        </div>
      </form>
    </section>
  );
}

function AdminAnalyticsTab({ onToast }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  // State cho bộ lọc
  const [period, setPeriod] = useState('month'); // 'today', 'week', 'month', 'year', 'all'
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/summary', {
        params: { period, month, year }
      });
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      onToast?.('Không thể tải dữ liệu thống kê', 'error');
    } finally {
      setLoading(false);
    }
  }, [month, onToast, period, year]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="loading-spinner-simple"></div>
        <p>Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="admin-empty-state">
        <span className="admin-empty-icon">📊</span>
        <p>Không thể tải dữ liệu thống kê.</p>
      </div>
    );
  }

  // Định dạng dữ liệu cho biểu đồ
  // API mới trả về chartData và dataGrouping
  const normalizeMetric = (value) => {
    if (value === null || value === undefined) return 0;
    const numericValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  };

  const chartData = (analytics.chartData || [])
    .map((item) => {
      const isMonthly = analytics.dataGrouping === 'monthly';
      let dateValue = item.date;

      if (isMonthly && item._id && !dateValue) {
        dateValue = new Date(`${item._id}-01`);
      } else if (dateValue) {
        dateValue = new Date(dateValue);
      } else {
        dateValue = new Date();
      }

      const totalCommission = normalizeMetric(
        item.totalCommission ?? item.metrics?.totalCommission
      );
      const totalRevenue = normalizeMetric(item.totalRevenue ?? item.metrics?.totalRevenue);
      const newUsers = normalizeMetric(item.newUsers ?? item.metrics?.newUsers);
      const newListings = normalizeMetric(item.newListings ?? item.metrics?.newListings);

      return {
        ...item,
        totalCommission,
        totalRevenue,
        newUsers,
        newListings,
        __dateValue: dateValue,
        dateLabel: dateValue.toLocaleDateString('vi-VN', {
          day: isMonthly ? undefined : '2-digit',
          month: '2-digit',
          year: isMonthly ? 'numeric' : undefined,
        }),
      };
    })
    .sort((a, b) => a.__dateValue - b.__dateValue)
    .map(({ __dateValue, ...rest }) => rest);

  const summaryFromApi = analytics.summary || {};
  const derivedTotals = chartData.reduce(
    (acc, item) => ({
      totalCommission: acc.totalCommission + normalizeMetric(item.totalCommission),
      totalRevenue: acc.totalRevenue + normalizeMetric(item.totalRevenue),
      totalNewUsers: acc.totalNewUsers + normalizeMetric(item.newUsers),
      totalNewListings: acc.totalNewListings + normalizeMetric(item.newListings),
    }),
    { totalCommission: 0, totalRevenue: 0, totalNewUsers: 0, totalNewListings: 0 }
  );

  const summary = {
    totalCommission: normalizeMetric(
      summaryFromApi.totalCommission ?? derivedTotals.totalCommission
    ),
    totalRevenue: normalizeMetric(summaryFromApi.totalRevenue ?? derivedTotals.totalRevenue),
    totalNewUsers: normalizeMetric(summaryFromApi.totalNewUsers ?? derivedTotals.totalNewUsers),
    totalNewListings: normalizeMetric(
      summaryFromApi.totalNewListings ?? derivedTotals.totalNewListings
    ),
  };

  // Tạo danh sách năm (từ năm hiện tại trở về trước 5 năm)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <section className="admin-section">
      <header className="admin-section-header">
        <div>
          <h3 className="admin-section-title">Thống kê tổng quan</h3>
          <p className="admin-section-subtitle">
            Phân tích hiệu suất giao dịch, người dùng và tin đăng trong khoảng thời gian tùy chọn.
          </p>
        </div>
      </header>

      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <label className="admin-input-label" htmlFor="analytics-period">
            Khoảng thời gian
          </label>
          <select
            id="analytics-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="admin-input"
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Theo tháng</option>
            <option value="year">Theo năm</option>
            <option value="all">Từ trước đến giờ</option>
          </select>
        </div>

        {period === 'month' && (
          <div className="admin-filter-group">
            <label className="admin-input-label" htmlFor="analytics-month">
              Tháng
            </label>
            <select
              id="analytics-month"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="admin-input"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>
        )}

        {(period === 'month' || period === 'year') && (
          <div className="admin-filter-group">
            <label className="admin-input-label" htmlFor="analytics-year">
              Năm
            </label>
            <select
              id="analytics-year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="admin-input"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="admin-stats-grid">
        <StatCard
          title="Tổng Doanh Thu (Hoa hồng)"
          value={`${summary.totalCommission?.toLocaleString('vi-VN') || 0} đ`}
        />
        <StatCard
          title="Tổng Giá trị Giao dịch"
          value={`${summary.totalRevenue?.toLocaleString('vi-VN') || 0} đ`}
        />
        <StatCard
          title="Người dùng mới"
          value={summary.totalNewUsers?.toLocaleString('vi-VN') || 0}
        />
        <StatCard
          title="Tin đăng mới"
          value={summary.totalNewListings?.toLocaleString('vi-VN') || 0}
        />
      </div>

      <h4 className="admin-section-subheading">Biểu đồ xu hướng</h4>

      <div className="admin-chart-grid">
        <ChartBox title="Doanh thu (Hoa hồng)">
          <ReusableAnalyticsChart data={chartData} dataKey="totalCommission" color="#4f46e5" />
        </ChartBox>

        <ChartBox title="Tổng giá trị giao dịch">
          <ReusableAnalyticsChart data={chartData} dataKey="totalRevenue" color="#f97316" />
        </ChartBox>

        <ChartBox title="Người dùng mới">
          <ReusableAnalyticsChart data={chartData} dataKey="newUsers" color="#22c55e" />
        </ChartBox>

        <ChartBox title="Tin đăng mới">
          <ReusableAnalyticsChart data={chartData} dataKey="newListings" color="#facc15" />
        </ChartBox>
      </div>
    </section>
  );
}

// Component phụ: StatCard
function StatCard({ title, value }) {
  return (
    <div style={{ 
      background: 'var(--bg-muted)', 
      padding: '1rem', 
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)'
    }}>
      <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>
        {title}
      </h4>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
        {value || 0}
      </p>
    </div>
  );
}

// Component bọc (wrapper) cho biểu đồ
function ChartBox({ title, children }) {
  return (
    <div style={{ 
      background: 'var(--bg-muted)', 
      padding: '1rem', 
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)'
    }}>
      <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
        {title}
      </h4>
      <div style={{ width: '100%', height: 300 }}>
        {children}
      </div>
    </div>
  );
}

// Component biểu đồ tái sử dụng
function ReusableAnalyticsChart({ data, dataKey, color }) {
  const sanitizedData = Array.isArray(data)
    ? data.map((item) => ({
        ...item,
        [dataKey]: Number.isFinite(Number(item[dataKey])) ? Number(item[dataKey]) : 0,
      }))
    : [];

  const hasMeaningfulData = sanitizedData.some((item) => Number(item[dataKey]) > 0);

  if (!sanitizedData.length || !hasMeaningfulData) {
    return <div className="admin-chart-empty">Chưa có dữ liệu xu hướng</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart 
        data={sanitizedData} 
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="dateLabel" stroke="var(--text-body)" />
        <YAxis 
          stroke="var(--text-body)"
          tickFormatter={(value) => 
            value > 1000000 ? `${value / 1000000}tr` : (value > 1000 ? `${value / 1000}k` : value)
          }
        />
        <Tooltip 
          contentStyle={{ 
            background: 'var(--bg-card)', 
            borderColor: 'var(--color-border)' 
          }}
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          dot={{ r: 3 }} 
          activeDot={{ r: 5 }} 
          strokeWidth={2} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AdminUsersTab({ onToast, onConfirm }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      setUsers(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      onToast?.('Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateUser = useCallback(
    async (userId, field, value) => {
      try {
        const updateData = {};
        if (field === 'role') {
          updateData.role = value;
        } else if (field === 'isActive') {
          updateData.isActive = value === 'true' || value === true;
        } else if (field === 'username') {
          updateData.username = value;
        }

        await api.put(`/auth/users/${userId}`, updateData);
        onToast?.('Cập nhật thông tin người dùng thành công', 'success');
        fetchUsers();
      } catch (err) {
        console.error(err);
        onToast?.(`Không thể cập nhật: ${err.response?.data?.message || err.message}`, 'error');
      }
    },
    [fetchUsers, onToast]
  );

  const handleDeleteUser = useCallback(
    (userId) => {
      onConfirm?.({
        title: 'Xóa người dùng',
        message: 'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa người dùng này?',
        confirmText: 'Xóa',
        confirmVariant: 'danger',
        onConfirm: async () => {
          try {
            await api.delete(`/auth/users/${userId}`);
            onToast?.('Đã xóa người dùng', 'success');
            await fetchUsers();
          } catch (err) {
            console.error(err);
            onToast?.(`Không thể xóa: ${err.response?.data?.message || err.message}`, 'error');
          }
        },
      });
    },
    [fetchUsers, onConfirm, onToast]
  );

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="loading-spinner-simple"></div>
        <p>Đang tải người dùng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-state">
        <span className="admin-empty-icon">⚠️</span>
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <section className="admin-section">
      <header className="admin-section-header">
        <div>
          <h3 className="admin-section-title">Quản lý Người dùng ({users.length})</h3>
          <p className="admin-section-subtitle">
            Điều chỉnh quyền, trạng thái hoạt động và thông tin hồ sơ của người dùng.
          </p>
        </div>
        <button type="button" className="admin-refresh-button" onClick={fetchUsers}>
          ↻ Tải lại
        </button>
      </header>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Tên hiển thị</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const userId = user._id || user.id;
              const profile = user.profile || {};
              return (
                <tr key={userId}>
                  <td>{userId}</td>
                  <td>{profile.email || '—'}</td>
                  <td>{profile.phonenumber || '—'}</td>
                  <td>
                    <input
                      type="text"
                      defaultValue={profile.username || ''}
                      onBlur={(e) => {
                        if (e.target.value !== profile.username) {
                          handleUpdateUser(userId, 'username', e.target.value);
                        }
                      }}
                      className="admin-input"
                    />
                  </td>
                  <td>
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => handleUpdateUser(userId, 'role', e.target.value)}
                      className="admin-input"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={user.isActive === false ? 'false' : 'true'}
                      onChange={(e) => handleUpdateUser(userId, 'isActive', e.target.value)}
                      className="admin-input"
                    >
                      <option value="true">Active</option>
                      <option value="false">Deactivated</option>
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(userId)}
                      className="admin-action-button admin-action-danger"
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'primary',
  onCancel,
  onConfirm,
  loading = false,
}) {
  return (
    <div className="admin-modal-backdrop" onClick={loading ? undefined : onCancel}>
      <div
        className="admin-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h4 id="admin-confirm-title" className="admin-modal-title">
          {title}
        </h4>
        <p id="admin-confirm-message" className="admin-modal-message">
          {message}
        </p>
        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-action-button admin-action-ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText || 'Hủy'}
          </button>
          <button
            type="button"
            className={`admin-action-button admin-action-${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : confirmText || 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;

