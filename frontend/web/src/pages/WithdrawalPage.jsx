import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';
import './WithdrawalPage.css';

const WithdrawalPage = () => {
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [withdrawalRequests, setWithdrawalRequests] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [bankInfo, setBankInfo] = useState(null);

    const QUICK_AMOUNTS = [100000, 500000, 1000000, 5000000, 10000000];

    useEffect(() => {
        fetchWalletBalance();
        fetchWithdrawalRequests();
        fetchBankInfo();
    }, []);

    const fetchWalletBalance = async () => {
        try {
            const token = localStorage.getItem('evb_token');
            // Gọi qua gateway: /api/auth/wallet/balance
            const response = await axios.get('/api/auth/wallet/balance', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWalletBalance(response.data.walletBalance || 0);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    const fetchBankInfo = async () => {
        try {
            // Sử dụng cùng endpoint /auth/me như trang Hồ sơ để lấy ví
            const response = await api.get('/auth/me');
            setBankInfo(response.data.wallet || {});
        } catch (error) {
            console.error('Error fetching bank info:', error);
        }
    };

    const fetchWithdrawalRequests = async () => {
        try {
            const token = localStorage.getItem('evb_token');
            // Gọi qua gateway: /api/transactions/withdrawals/my-requests
            const response = await axios.get('/api/transactions/withdrawals/my-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWithdrawalRequests(response.data.data || []);
        } catch (error) {
            console.error('Error fetching withdrawal requests:', error);
        }
    };

    const handleQuickAmount = (value) => {
        setAmount(value.toString());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            alert('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        if (parseFloat(amount) > walletBalance) {
            alert('Số dư không đủ để rút tiền');
            return;
        }

        if (!bankInfo || !bankInfo.bankName || bankInfo.bankName.trim() === '' || !bankInfo.accountNumber || bankInfo.accountNumber.trim() === '') {
            alert('Vui lòng cập nhật thông tin ngân hàng trong trang Hồ sơ trước khi rút tiền');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('evb_token');

            const requestData = {
                amount: parseFloat(amount),
                note
            };

            // Gọi qua gateway: /api/transactions/withdrawals/request
            await axios.post('/api/transactions/withdrawals/request', requestData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Yêu cầu rút tiền đã được gửi! Admin sẽ xử lý trong vòng 24h.');

            // Reset form
            setAmount('');
            setNote('');

            // Refresh data
            fetchWithdrawalRequests();
        } catch (error) {
            console.error('Error creating withdrawal request:', error);
            alert(error.response?.data?.error || 'Không thể tạo yêu cầu rút tiền');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'Chờ xử lý', className: 'status-pending' },
            completed: { label: 'Hoàn thành', className: 'status-approved' },
            rejected: { label: 'Từ chối', className: 'status-rejected' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <span className={`status-badge ${config.className}`}>{config.label}</span>;
    };

    return (
        <div className="withdrawal-page">
            <div className="withdrawal-container">
                {/* Header */}
                <div className="withdrawal-header">
                    <h1>💸 Rút tiền từ ví</h1>
                    <div className="wallet-balance-display">
                        <span className="balance-label">Số dư hiện tại:</span>
                        <span className="balance-amount">{walletBalance.toLocaleString('vi-VN')} đ</span>
                    </div>
                </div>

                <div className="withdrawal-content">
                    {/* Left: Withdrawal Form */}
                    <div className="withdrawal-form-section">
                        {bankInfo && (bankInfo.bankName || bankInfo.accountNumber || bankInfo.accountName) ? (
                            <div className="bank-info-card">
                                <h3>🏦 Thông tin tài khoản nhận tiền</h3>
                                <div className="bank-info-item">
                                    <span className="label">Ngân hàng:</span>
                                    <span className="value">{bankInfo.bankName}</span>
                                </div>
                                <div className="bank-info-item">
                                    <span className="label">Số tài khoản:</span>
                                    <span className="value">{bankInfo.accountNumber}</span>
                                </div>
                                <div className="bank-info-item">
                                    <span className="label">Tên tài khoản:</span>
                                    <span className="value">{bankInfo.accountName}</span>
                                </div>
                                {bankInfo.branch && (
                                    <div className="bank-info-item">
                                        <span className="label">Chi nhánh:</span>
                                        <span className="value">{bankInfo.branch}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bank-info-warning">
                                <h3>⚠️ Chưa có thông tin ngân hàng</h3>
                                <p>Vui lòng cập nhật thông tin ngân hàng trong trang <a href="/profile">Hồ sơ</a> để có thể rút tiền.</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="withdrawal-form">
                            <h3>📝 Thông tin rút tiền</h3>

                            {/* Quick Amount Buttons */}
                            <div className="form-group">
                                <label>Chọn nhanh:</label>
                                <div className="quick-amounts">
                                    {QUICK_AMOUNTS.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            className={`quick-amount-btn ${amount === value.toString() ? 'active' : ''} ${value > walletBalance ? 'disabled' : ''}`}
                                            onClick={() => handleQuickAmount(value)}
                                            disabled={value > walletBalance}
                                        >
                                            {(value / 1000000).toFixed(value >= 1000000 ? 0 : 1)}M
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amount Input */}
                            <div className="form-group">
                                <label>Số tiền rút (đ) *</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Nhập số tiền"
                                    min="0"
                                    max={walletBalance}
                                    step="1000"
                                    required
                                />
                                {amount && (
                                    <div className="amount-preview">
                                        {parseFloat(amount).toLocaleString('vi-VN')} đ
                                        {parseFloat(amount) > walletBalance && (
                                            <span className="error-text"> - Vượt quá số dư!</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Note */}
                            <div className="form-group">
                                <label>Ghi chú (tùy chọn)</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Thêm ghi chú nếu cần..."
                                    rows="3"
                                />
                            </div>

                            <div className="withdrawal-notice">
                                <strong>⏱️ Lưu ý:</strong> Yêu cầu rút tiền sẽ được xử lý trong vòng 24 giờ làm việc.
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading || !bankInfo || !bankInfo.bankName || bankInfo.bankName.trim() === ''}
                            >
                                {loading ? '⏳ Đang gửi...' : '✅ Gửi yêu cầu rút tiền'}
                            </button>
                        </form>
                    </div>

                    {/* Right: Withdrawal History */}
                    <div className="withdrawal-history-section">
                        <h3>📜 Lịch sử rút tiền</h3>
                        {withdrawalRequests.length === 0 ? (
                            <div className="empty-state">
                                <p>Chưa có yêu cầu rút tiền nào</p>
                            </div>
                        ) : (
                            <div className="withdrawal-list">
                                {withdrawalRequests.map((request) => (
                                    <div key={request._id} className="withdrawal-item">
                                        <div className="withdrawal-item-header">
                                            <span className="withdrawal-amount">
                                                -{request.amount.toLocaleString('vi-VN')} đ
                                            </span>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <div className="withdrawal-item-body">
                                            <div className="withdrawal-info">
                                                <span className="info-label">Ngân hàng:</span>
                                                <span className="info-value">{request.bankInfo?.bankName}</span>
                                            </div>
                                            <div className="withdrawal-info">
                                                <span className="info-label">Số TK:</span>
                                                <span className="info-value">{request.bankInfo?.accountNumber}</span>
                                            </div>
                                            <div className="withdrawal-info">
                                                <span className="info-label">Ngày tạo:</span>
                                                <span className="info-value">
                                                    {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            {request.status === 'completed' && request.processedAt && (
                                                <div className="withdrawal-info">
                                                    <span className="info-label">Ngày hoàn thành:</span>
                                                    <span className="info-value">
                                                        {new Date(request.processedAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            )}
                                            {request.transactionRef && (
                                                <div className="withdrawal-info">
                                                    <span className="info-label">Mã GD:</span>
                                                    <span className="info-value">{request.transactionRef}</span>
                                                </div>
                                            )}
                                            {request.adminNote && (
                                                <div className="admin-note">
                                                    <strong>Ghi chú admin:</strong> {request.adminNote}
                                                </div>
                                            )}
                                            {request.note && (
                                                <div className="user-note">
                                                    <strong>Ghi chú:</strong> {request.note}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WithdrawalPage;
