import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateAuctionPage() {
    const { listingId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const listingTitle = location.state?.listingTitle || '';
    const listingPrice = location.state?.listingPrice || 0;

    const [formData, setFormData] = useState({
        endTime: '',
        startingPrice: listingPrice,
        minBidIncrement: '500000',
        depositPercentage: '10',
        reservePrice: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('evb_token');
            const body = {
                listingId: listingId,
                title: listingTitle,
                startingPrice: parseFloat(formData.startingPrice),
                currentPrice: parseFloat(formData.startingPrice),
                minBidIncrement: parseFloat(formData.minBidIncrement),
                endTime: new Date(formData.endTime).toISOString(),
                depositPercentage: parseFloat(formData.depositPercentage),
                reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : undefined,
            };

            await api.post('/auctions/', body, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Tạo đấu giá thành công! Đợi admin duyệt.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi tạo đấu giá');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const depositAmount = (parseFloat(formData.startingPrice || 0) * parseFloat(formData.depositPercentage || 0) / 100);

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
            <div className="container py-8">
                <div className="card p-8" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-heading)' }}>
                        ⚙️ Thiết lập Đấu giá
                    </h2>

                    <div className="mb-6 p-4 rounded-lg" style={{ background: '#e3f2fd', border: '1px solid #2196f3' }}>
                        <h4 className="font-semibold" style={{ color: '#1565c0' }}>Tin đăng: {listingTitle}</h4>
                        <p style={{ color: '#1565c0', fontSize: '0.9rem' }}>Giá niêm yết: {parseFloat(listingPrice).toLocaleString('vi-VN')} đ</p>
                    </div>

                    {error && <div className="error-message mb-4">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Thời gian kết thúc */}
                            <div className="form-group">
                                <label className="form-label">Thời gian kết thúc *</label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    required
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    className="form-input"
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>

                            {/* Giá khởi điểm */}
                            <div className="form-group">
                                <label className="form-label">Giá khởi điểm (VND) *</label>
                                <input
                                    type="number"
                                    name="startingPrice"
                                    required
                                    value={formData.startingPrice}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="0"
                                />
                            </div>

                            {/* Bước giá */}
                            <div className="form-group">
                                <label className="form-label">Bước giá tối thiểu (VND) *</label>
                                <input
                                    type="number"
                                    name="minBidIncrement"
                                    required
                                    value={formData.minBidIncrement}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="0"
                                />
                            </div>

                            {/* % Đặt cọc */}
                            <div className="form-group">
                                <label className="form-label">% Đặt cọc *</label>
                                <input
                                    type="number"
                                    name="depositPercentage"
                                    required
                                    value={formData.depositPercentage}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="0"
                                    max="100"
                                />
                                <small style={{ color: '#666', fontSize: '0.875rem' }}>
                                    Người đấu giá sẽ cọc {depositAmount.toLocaleString('vi-VN')} đ
                                </small>
                            </div>

                            {/* Giá dự trữ */}
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Giá dự trữ (tùy chọn)</label>
                                <input
                                    type="number"
                                    name="reservePrice"
                                    value={formData.reservePrice}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="0"
                                />
                                <small style={{ color: '#666', fontSize: '0.875rem' }}>
                                    Giá tối thiểu bạn chấp nhận bán. Để trống nếu chắc chắn bán.
                                </small>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="mt-4 p-4 rounded-lg" style={{ background: '#e3f2fd' }}>
                            <h4 className="font-semibold mb-2" style={{ color: '#1565c0' }}>📋 Tóm tắt:</h4>
                            <ul style={{ fontSize: '0.875rem', color: '#1565c0', listStyle: 'none', paddingLeft: 0 }}>
                                <li>• Giá khởi điểm: <strong>{parseFloat(formData.startingPrice || 0).toLocaleString('vi-VN')} đ</strong></li>
                                <li>• Bước giá: <strong>{parseFloat(formData.minBidIncrement || 0).toLocaleString('vi-VN')} đ</strong></li>
                                <li>• Đặt cọc: <strong>{formData.depositPercentage}% ({depositAmount.toLocaleString('vi-VN')} đ)</strong></li>
                                {formData.endTime && (
                                    <li>• Kết thúc: <strong>{new Date(formData.endTime).toLocaleString('vi-VN')}</strong></li>
                                )}
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-full mt-6"
                        >
                            {loading ? 'Đang xử lý...' : '✅ Tạo đấu giá'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateAuctionPage;
