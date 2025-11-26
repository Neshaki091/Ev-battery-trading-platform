import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DepositPage.css';

const DepositPage = () => {
    const [depositRequests, setDepositRequests] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [amount, setAmount] = useState('');

    // Thông tin ngân hàng nhận tiền (tài khoản hệ thống đã kết nối Casso)
    const BANK_INFO = {
        bankName: 'ACB Official',
        bankCode: 'ACB',
        accountNumber: '22729081',
        accountName: 'EVB-TRADING-COMPANY',
        branch: 'ACB'
    };

    const QUICK_AMOUNTS = [100000, 500000, 1000000, 5000000, 10000000];

    // Lấy userId để hiển thị mã nạp ví tự động qua Casso
    const storedUser = JSON.parse(localStorage.getItem('evb_user') || '{}');
    const walletUserId = storedUser._id || storedUser.user_id || '';
    const WALLET_REF = walletUserId ? `WALLET#${walletUserId}` : '';

    useEffect(() => {
        fetchWalletBalance();
        fetchDepositRequests();

        // Poll định kỳ để bắt được cập nhật từ Casso và hiển thị popup
        const interval = setInterval(() => {
            fetchWalletBalance();
            fetchDepositRequests();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchWalletBalance = async () => {
        try {
            const token = localStorage.getItem('evb_token');
            // Gọi qua gateway: /api/auth/wallet/balance (Vite proxy hoặc Nginx)
            const response = await axios.get('/api/auth/wallet/balance', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newBalance = response.data.walletBalance || 0;

            // Cập nhật số dư trên UI
            setWalletBalance(newBalance);

            // Dùng localStorage để chỉ popup khi số dư tăng so với lần gần nhất
            const stored = Number(localStorage.getItem('evb_last_wallet_balance') || '0');

            if (newBalance > stored) {
                // Bỏ qua popup lần đầu nếu user chưa từng có số dư (tùy bạn, hiện tại vẫn cho hiện)
                alert(
                    `✅ Nạp tiền thành công! Số dư mới của bạn là ${newBalance.toLocaleString(
                        'vi-VN'
                    )} đ.`
                );
                localStorage.setItem('evb_last_wallet_balance', String(newBalance));
            } else if (stored === 0 && newBalance > 0) {
                // Lần đầu sau khi triển khai feature, lưu giá trị để không spam
                localStorage.setItem('evb_last_wallet_balance', String(newBalance));
            }
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    const fetchDepositRequests = async () => {
        try {
            const token = localStorage.getItem('evb_token');
            // Gọi qua gateway: /api/transactions/deposits/my-requests
            const response = await axios.get('/api/transactions/deposits/my-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepositRequests(response.data.data || []);
        } catch (error) {
            console.error('Error fetching deposit requests:', error);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Đã copy!');
    };

    const handleQuickAmount = (value) => {
        setAmount(value.toString());
    };

    const amountNumber = parseInt(amount, 10) || 0;
    const vietQRUrl = `https://img.vietqr.io/image/${BANK_INFO.bankCode}-${BANK_INFO.accountNumber}-compact.png` +
        `?accountName=${encodeURIComponent(BANK_INFO.accountName)}` +
        (amountNumber > 0 ? `&amount=${amountNumber}` : '') +
        (WALLET_REF ? `&addInfo=${encodeURIComponent(WALLET_REF)}` : '');

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'Chờ duyệt', className: 'status-pending' },
            approved: { label: 'Đã duyệt', className: 'status-approved' },
            rejected: { label: 'Từ chối', className: 'status-rejected' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <span className={`status-badge ${config.className}`}>{config.label}</span>;
    };

    return (
        <div className="deposit-page">
            <div className="deposit-container">
                <div className="deposit-header">
                    <h1>💰 Nạp tiền vào ví</h1>
                    <div className="wallet-balance-display">
                        <span className="balance-label">Số dư hiện tại:</span>
                        <span className="balance-amount">{walletBalance.toLocaleString('vi-VN')} đ</span>
                    </div>
                </div>

                <div className="deposit-content">
                    <div className="deposit-form-section">
                        <div className="bank-info-card">
                            <h3>📋 Thông tin chuyển khoản</h3>
                            <div className="bank-info-item">
                                <span className="label">Ngân hàng:</span>
                                <span className="value">
                                    {BANK_INFO.bankName} ({BANK_INFO.bankCode})
                                    <button onClick={() => copyToClipboard(BANK_INFO.bankName)} className="copy-btn">📋</button>
                                </span>
                            </div>
                            <div className="bank-info-item">
                                <span className="label">Số tài khoản:</span>
                                <span className="value">
                                    {BANK_INFO.accountNumber}
                                    <button onClick={() => copyToClipboard(BANK_INFO.accountNumber)} className="copy-btn">📋</button>
                                </span>
                            </div>
                            <div className="bank-info-item">
                                <span className="label">Tên tài khoản:</span>
                                <span className="value">
                                    {BANK_INFO.accountName}
                                    <button onClick={() => copyToClipboard(BANK_INFO.accountName)} className="copy-btn">📋</button>
                                </span>
                            </div>
                            <div className="bank-info-item">
                                <span className="label">Chi nhánh:</span>
                                <span className="value">{BANK_INFO.branch}</span>
                            </div>

                            <div className="transfer-note">
                                <strong>⚠️ Lưu ý quan trọng (Casso tự động):</strong>
                                <ul style={{ margin: '0.5rem 0 0 1.5rem', paddingLeft: 0 }}>
                                    {WALLET_REF && (
                                        <li>
                                            Nội dung chuyển khoản <strong>BẮT BUỘC</strong> phải chứa:&nbsp;
                                            <strong>{WALLET_REF}</strong>
                                            <button
                                                onClick={() => copyToClipboard(WALLET_REF)}
                                                className="copy-btn"
                                                style={{ marginLeft: '0.5rem' }}
                                            >
                                                📋
                                            </button>
                                        </li>
                                    )}
                                    <li>Chuyển đúng <strong>số tài khoản và số tiền</strong> bạn muốn nạp.</li>
                                    <li>🤖 Hệ thống sẽ tự động cộng tiền vào ví trong vài giây sau khi Casso nhận giao dịch.</li>
                                    <li>Không cần gửi form nạp tiền thủ công. Nếu hơn 10 phút chưa thấy cập nhật, hãy liên hệ admin.</li>
                                </ul>
                            </div>
                        </div>

                        {/* QR nạp nhanh qua VietQR */}
                        <div className="qr-card">
                            <h3>📱 Quét QR để nạp nhanh</h3>
                            <p style={{ marginBottom: '0.5rem' }}>
                                Chọn số tiền hoặc nhập tay, sau đó dùng app ngân hàng quét QR bên dưới. Nội dung và STK sẽ được điền sẵn.
                            </p>

                            <div className="form-group">
                                <label>Chọn nhanh số tiền:</label>
                                <div className="quick-amounts">
                                    {QUICK_AMOUNTS.map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            className={`quick-amount-btn ${amount === value.toString() ? 'active' : ''}`}
                                            onClick={() => handleQuickAmount(value)}
                                        >
                                            {(value / 1000000).toFixed(value >= 1000000 ? 0 : 1)}M
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Số tiền nạp (đ)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Nhập số tiền hoặc chọn nhanh phía trên"
                                    min="0"
                                    step="1000"
                                />
                                {amount && (
                                    <div className="amount-preview">
                                        {amountNumber.toLocaleString('vi-VN')} đ
                                    </div>
                                )}
                            </div>

                            <div className="qr-preview">
                                <img
                                    src={vietQRUrl}
                                    alt="VietQR nạp ví EVB"
                                    style={{ maxWidth: '260px', width: '100%', borderRadius: '12px' }}
                                />
                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                    Mã QR sinh bởi <code>img.vietqr.io</code>. Hãy kiểm tra lại số tiền và nội dung chứa{' '}
                                    <strong>{WALLET_REF}</strong> trước khi xác nhận chuyển khoản.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="deposit-history-section">
                        <h3>📜 Lịch sử nạp tiền</h3>
                        {depositRequests.length === 0 ? (
                            <div className="empty-state">
                                <p>Chưa có yêu cầu nạp tiền nào</p>
                            </div>
                        ) : (
                            <div className="deposit-list">
                                {depositRequests.map((request) => (
                                    <div key={request._id} className="deposit-item">
                                        <div className="deposit-item-header">
                                            <span className="deposit-amount">
                                                +{request.amount.toLocaleString('vi-VN')} đ
                                            </span>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <div className="deposit-item-body">
                                            <div className="deposit-info">
                                                <span className="info-label">Mã GD:</span>
                                                <span className="info-value">{request.bankTransferInfo?.transactionRef}</span>
                                            </div>
                                            <div className="deposit-info">
                                                <span className="info-label">Ngày tạo:</span>
                                                <span className="info-value">
                                                    {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            {request.status === 'approved' && request.processedAt && (
                                                <div className="deposit-info">
                                                    <span className="info-label">Ngày duyệt:</span>
                                                    <span className="info-value">
                                                        {new Date(request.processedAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            )}
                                            {request.adminNote && (
                                                <div className="admin-note">
                                                    <strong>Ghi chú admin:</strong> {request.adminNote}
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

export default DepositPage;
