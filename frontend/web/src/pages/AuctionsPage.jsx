import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAuctions,
  createAuction,
} from '../services/auction';

const defaultForm = {
  listingId: '',
  title: '',
  startTime: '',
  endTime: '',
  startingPrice: '',
  minBidIncrement: '',
  buyNowPrice: '',
};

function AuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadAuctions = useMemo(
    () => async () => {
      try {
        setLoading(true);
        const response = await fetchAuctions({ limit: 20 });
        setAuctions(response.data || []);
      } catch (err) {
        console.error('Failed to load auctions', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAuction = async (event) => {
    event.preventDefault();
    setError('');
    setCreating(true);
    try {
      const payload = {
        ...form,
        startTime: form.startTime
          ? new Date(form.startTime).toISOString()
          : undefined,
        endTime: form.endTime
          ? new Date(form.endTime).toISOString()
          : undefined,
        startingPrice: form.startingPrice
          ? Number(form.startingPrice)
          : undefined,
        minBidIncrement: form.minBidIncrement
          ? Number(form.minBidIncrement)
          : undefined,
        buyNowPrice: form.buyNowPrice
          ? Number(form.buyNowPrice)
          : undefined,
      };

      await createAuction(payload);
      setForm(defaultForm);
      await loadAuctions();
    } catch (err) {
      console.error('Failed to create auction', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container py-8" style={{ minHeight: '100vh' }}>
      <h1 className="text-4xl font-bold mb-6" style={{ color: 'var(--text-heading)' }}>
        Phiên đấu giá
      </h1>

      {error && (
        <div className="error-message mb-4" style={{ maxWidth: 600 }}>
          {error}
        </div>
      )}

      <section className="card p-6 mb-8" style={{ maxWidth: 720 }}>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
          Tạo phiên đấu giá mới
        </h2>
        <form className="grid gap-4" onSubmit={handleCreateAuction}>
          <div className="grid gap-2">
            <label className="form-label" htmlFor="listingId">
              Listing ID <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="listingId"
              name="listingId"
              type="text"
              required
              className="form-input"
              value={form.listingId}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-2">
            <label className="form-label" htmlFor="title">
              Tiêu đề
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              value={form.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-2">
            <label className="form-label" htmlFor="startTime">
              Thời gian bắt đầu <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              required
              className="form-input"
              value={form.startTime}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-2">
            <label className="form-label" htmlFor="endTime">
              Thời gian kết thúc <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              required
              className="form-input"
              value={form.endTime}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-2">
            <label className="form-label" htmlFor="startingPrice">
              Giá khởi điểm (VND) <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="startingPrice"
              name="startingPrice"
              type="number"
              min="0"
              required
              className="form-input"
              value={form.startingPrice}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-2">
            <label className="form-label" htmlFor="minBidIncrement">
              Bước giá tối thiểu (VND)
            </label>
            <input
              id="minBidIncrement"
              name="minBidIncrement"
              type="number"
              min="0"
              className="form-input"
              value={form.minBidIncrement}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-2">
            <label className="form-label" htmlFor="buyNowPrice">
              Giá mua ngay (VND)
            </label>
            <input
              id="buyNowPrice"
              name="buyNowPrice"
              type="number"
              min="0"
              className="form-input"
              value={form.buyNowPrice}
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={creating}
          >
            {creating ? 'Đang tạo...' : 'Tạo phiên đấu giá'}
          </button>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
          Danh sách phiên đấu giá
        </h2>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : auctions.length === 0 ? (
          <p>Chưa có phiên đấu giá nào.</p>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className="table-header">ID</th>
                  <th className="table-header">Listing</th>
                  <th className="table-header">Trạng thái</th>
                  <th className="table-header">Giá hiện tại</th>
                  <th className="table-header">Ngày kết thúc</th>
                  <th className="table-header">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {auctions.map((auction) => (
                  <tr key={auction._id} className="table-row">
                    <td>{auction._id}</td>
                    <td>{auction.listingId}</td>
                    <td>{auction.computedStatus || auction.status}</td>
                    <td>{auction.currentPrice?.toLocaleString('vi-VN') || '--'}</td>
                    <td>
                      {auction.endTime
                        ? new Date(auction.endTime).toLocaleString('vi-VN')
                        : '--'}
                    </td>
                    <td>
                      <Link className="nav-link-button" to={`/auctions/${auction._id}`}>
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AuctionsPage;

