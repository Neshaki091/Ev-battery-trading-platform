import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchAuctionById,
  placeBid,
  buyNow,
  cancelAuction,
  settleAuction,
} from '../services/auction';

const currency = (value) =>
  typeof value === 'number'
    ? value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    : '—';

function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reload = useMemo(
    () => async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await fetchAuctionById(id);
        setAuction(response.data);
        setBids(response.data?.bids || []);
      } catch (err) {
        console.error('Failed to load auction', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  const handlePlaceBid = useCallback(
    async (event) => {
      event.preventDefault();
      setSubmitting(true);
      setError('');
      try {
        await placeBid(id, Number(bidAmount));
        setBidAmount('');
        await reload();
      } catch (err) {
        console.error('Failed to place bid', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [bidAmount, id, reload]
  );

  const handleBuyNow = async () => {
    setSubmitting(true);
    setError('');
    try {
      await buyNow(id);
      await reload();
    } catch (err) {
      console.error('Failed to buy now', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bạn chắc chắn muốn hủy phiên đấu giá này?')) {
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await cancelAuction(id);
      await reload();
    } catch (err) {
      console.error('Failed to cancel auction', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettle = async () => {
    setSubmitting(true);
    setError('');
    try {
      await settleAuction(id);
      await reload();
    } catch (err) {
      console.error('Failed to settle auction', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container py-8">
        <p>Không tìm thấy phiên đấu giá.</p>
        <button className="nav-link-button mt-4" onClick={() => navigate('/auctions')}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const status = auction.computedStatus || auction.status;
  const isActive = status === 'active';
  const canBuyNow = Boolean(auction.buyNowPrice) && (status === 'active' || status === 'scheduled');

  return (
    <div className="container py-8" style={{ minHeight: '100vh' }}>
      <button className="nav-link mb-4" onClick={() => navigate('/auctions')}>
        ← Quay lại danh sách
      </button>

      <div className="card p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-heading)' }}>
          Phiên đấu giá #{auction._id}
        </h1>
        {error && <div className="error-message mb-4">{error}</div>}

        <div className="grid gap-2">
          <p><strong>Listing:</strong> {auction.listingId}</p>
          <p><strong>Tiêu đề:</strong> {auction.title || '—'}</p>
          <p><strong>Trạng thái:</strong> {status}</p>
          <p><strong>Giá khởi điểm:</strong> {currency(auction.startingPrice)}</p>
          <p><strong>Giá hiện tại:</strong> {currency(auction.currentPrice)}</p>
          <p><strong>Bước giá tối thiểu:</strong> {currency(auction.minBidIncrement)}</p>
          <p><strong>Giá mua ngay:</strong> {currency(auction.buyNowPrice)}</p>
          <p><strong>Bắt đầu:</strong> {new Date(auction.startTime).toLocaleString('vi-VN')}</p>
          <p><strong>Kết thúc:</strong> {new Date(auction.endTime).toLocaleString('vi-VN')}</p>
          <p><strong>Số lượt bid:</strong> {auction.bidCount}</p>
        </div>

        <div className="flex gap-3 mt-4">
          {canBuyNow && (
            <button className="nav-link-button" disabled={submitting} onClick={handleBuyNow}>
              {submitting ? 'Đang xử lý...' : 'Mua ngay'}
            </button>
          )}
          <button className="btn btn-secondary" disabled={submitting} onClick={handleCancel}>
            Hủy phiên
          </button>
          <button className="btn btn-primary" disabled={submitting} onClick={handleSettle}>
            Chốt phiên
          </button>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
          Đặt giá
        </h2>
        <form className="flex gap-4 flex-wrap items-end" onSubmit={handlePlaceBid}>
          <div className="grid gap-2">
            <label className="form-label" htmlFor="bidAmount">
              Giá đặt (VND)
            </label>
            <input
              id="bidAmount"
              type="number"
              min="0"
              className="form-input"
              value={bidAmount}
              onChange={(event) => setBidAmount(event.target.value)}
              required
              disabled={!isActive || submitting}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isActive || submitting}
          >
            {submitting ? 'Đang gửi...' : 'Đặt giá'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
          Lịch sử đặt giá
        </h2>
        {bids.length === 0 ? (
          <p>Chưa có lượt đặt giá nào.</p>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className="table-header">Thời gian</th>
                  <th className="table-header">Người đặt</th>
                  <th className="table-header">Giá</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid) => (
                  <tr key={bid._id} className="table-row">
                    <td>{new Date(bid.createdAt).toLocaleString('vi-VN')}</td>
                    <td>{bid.bidderId}</td>
                    <td>{currency(bid.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuctionDetailPage;

