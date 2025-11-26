import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import './ProfessionalAuctionPage.css';

const ProfessionalAuctionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [auction, setAuction] = useState(null);
    const [listing, setListing] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [lastBidAmount, setLastBidAmount] = useState(0);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isEnded, setIsEnded] = useState(false);

    const bidFeedRef = useRef(null);

    useEffect(() => {
        fetchAuctionDetails();
        fetchWalletBalance();
        const interval = setInterval(fetchAuctionDetails, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        if (auction) {
            const timer = setInterval(() => {
                updateCountdown();
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [auction]);

    const updateCountdown = () => {
        if (!auction || !auction.endTime) return;

        const now = new Date();
        const end = new Date(auction.endTime);
        const diff = end - now;

        if (diff <= 0) {
            setIsEnded(true);
            setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
    };

    const fetchAuctionDetails = async () => {
        try {
            const token = localStorage.getItem('evb_token');

            // Fetch auction (qua gateway → auction-service)
            const auctionRes = await axios.get(`/auctions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const auctionData = auctionRes.data.data || auctionRes.data;
            const previousPrice = auction?.currentPrice || 0;
            const newPrice = auctionData.currentPrice || auctionData.startingPrice;

            // Show confetti if price increased
            if (newPrice > previousPrice && previousPrice > 0) {
                setLastBidAmount(newPrice);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
            }

            setAuction(auctionData);

            // Fetch listing (qua gateway → listing-service)
            if (auctionData.listingId) {
                const listingRes = await axios.get(
                    `/listings/${auctionData.listingId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setListing(listingRes.data.data || listingRes.data);
            }

            // Fetch bids (simulate for now, replace with actual endpoint)
            // In production: GET /auctions/${id}/bids
            setBids(generateMockBids(auctionData));

            setLoading(false);
        } catch (error) {
            console.error('Error fetching auction:', error);
            setLoading(false);
        }
    };

    const fetchWalletBalance = async () => {
        try {
            const token = localStorage.getItem('evb_token');
            const response = await axios.get('/api/auth/wallet/balance', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWalletBalance(response.data.walletBalance || 0);
            // For now, assume no reserved balance (in production, fetch from user profile)
            setAvailableBalance(response.data.walletBalance || 0);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    const generateMockBids = (auctionData) => {
        // This is mock data for demo. In production, fetch real bids from API
        const mockBids = [];
        const currentPrice = auctionData.currentPrice || auctionData.startingPrice;
        const increment = auctionData.minBidIncrement || 100000;

        for (let i = 0; i < 5 && currentPrice - (i * increment) >= auctionData.startingPrice; i++) {
            mockBids.push({
                _id: `bid_${i}`,
                amount: currentPrice - (i * increment),
                bidderId: { username: i === 0 ? 'You' : `User${i}` },
                createdAt: new Date(Date.now() - i * 60000).toISOString()
            });
        }
        return mockBids;
    };

    const handlePlaceBid = async () => {
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
            alert('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        const currentPrice = auction.currentPrice || auction.startingPrice;
        const minRequired = currentPrice + (auction.minBidIncrement || 0);

        if (parseFloat(bidAmount) < minRequired) {
            alert(`Giá đặt phải ít nhất ${minRequired.toLocaleString('vi-VN')} đ`);
            return;
        }

        const depositAmount = auction.depositRequired || (auction.startingPrice * (auction.depositPercentage || 10) / 100);

        if (availableBalance < depositAmount) {
            if (window.confirm(`Bạn cần tối thiểu ${depositAmount.toLocaleString('vi-VN')} đ trong ví. Bạn có muốn nạp tiền không?`)) {
                navigate('/deposit');
            }
            return;
        }

        try {
            const token = localStorage.getItem('evb_token');
            // Backend route: POST /:id/bids (qua gateway: /api/auctions/:id/bids)
            await axios.post(
                `/auctions/${id}/bids`,
                { amount: parseFloat(bidAmount) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Đặt giá thành công!');
            setBidAmount('');
            fetchAuctionDetails();
            fetchWalletBalance();
        } catch (error) {
            console.error('Error placing bid:', error);
            alert(error.response?.data?.message || 'Không thể đặt giá');
        }
    };

    const getQuickBidAmount = () => {
        const currentPrice = auction.currentPrice || auction.startingPrice;
        return currentPrice + (auction.minBidIncrement || 100000);
    };

    if (loading) {
        return (
            <div className="professional-auction-loading">
                <div className="spinner"></div>
                <p>Đang tải thông tin đấu giá...</p>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="professional-auction-error">
                <h2>Không tìm thấy phiên đấu giá</h2>
                <button onClick={() => navigate('/auctions')}>Quay lại</button>
            </div>
        );
    }

    const currentPrice = auction.currentPrice || auction.startingPrice;
    const depositAmount = auction.depositRequired || (auction.startingPrice * (auction.depositPercentage || 10) / 100);
    const hasEnoughBalance = availableBalance >= depositAmount;

    return (
        <div className="professional-auction-page">
            {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

            <div className="auction-container">
                {/* Header with Countdown */}
                <div className="auction-header">
                    <h1 className="auction-title">{auction.title || listing?.title || 'Đấu giá'}</h1>

                    {!isEnded ? (
                        <div className="countdown-timer">
                            <div className="countdown-label">⏱️ Thời gian còn lại:</div>
                            <div className="countdown-display">
                                {countdown.days > 0 && (
                                    <div className="countdown-unit">
                                        <span className="countdown-value">{countdown.days}</span>
                                        <span className="countdown-text">ngày</span>
                                    </div>
                                )}
                                <div className="countdown-unit">
                                    <span className="countdown-value">{String(countdown.hours).padStart(2, '0')}</span>
                                    <span className="countdown-text">giờ</span>
                                </div>
                                <div className="countdown-separator">:</div>
                                <div className="countdown-unit">
                                    <span className="countdown-value">{String(countdown.minutes).padStart(2, '0')}</span>
                                    <span className="countdown-text">phút</span>
                                </div>
                                <div className="countdown-separator">:</div>
                                <div className="countdown-unit">
                                    <span className="countdown-value animate-pulse">{String(countdown.seconds).padStart(2, '0')}</span>
                                    <span className="countdown-text">giây</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="auction-ended-badge">
                            🏁 ĐẤU GIÁ ĐÃ KẾT THÚC
                        </div>
                    )}
                </div>

                <div className="auction-content">
                    {/* Left Column: Listing Info */}
                    <div className="auction-left">
                        <div className="listing-images">
                            {listing?.images && listing.images.length > 0 ? (
                                <img src={listing.images[0]} alt={listing.title} className="listing-main-image" />
                            ) : (
                                <div className="listing-placeholder">No Image</div>
                            )}
                        </div>

                        <div className="listing-details">
                            <h3>📋 Thông tin sản phẩm</h3>
                            <p>{listing?.description || 'Không có mô tả'}</p>

                            <div className="listing-specs">
                                <div className="spec-item">
                                    <span className="spec-label">Giá khởi điểm:</span>
                                    <span className="spec-value">{auction.startingPrice.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">Bước giá:</span>
                                    <span className="spec-value">{(auction.minBidIncrement || 0).toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-label">Đặt cọc tối thiểu:</span>
                                    <span className="spec-value">{depositAmount.toLocaleString('vi-VN')} đ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bidding */}
                    <div className="auction-right">
                        {/* Current Price */}
                        <div className="current-price-card">
                            <div className="price-label">💰 Giá hiện tại</div>
                            <div className="price-amount animate-scale">
                                {currentPrice.toLocaleString('vi-VN')} đ
                            </div>
                            {auction.bidCount > 0 && (
                                <div className="bid-count">{auction.bidCount} lượt đặt giá</div>
                            )}
                        </div>

                        {/* Wallet Balance Warning */}
                        {!hasEnoughBalance && !isEnded && (
                            <div className="balance-warning animate-shake">
                                <div className="warning-icon">⚠️</div>
                                <div className="warning-content">
                                    <div className="warning-title">Số dư không đủ!</div>
                                    <div className="warning-text">
                                        Cần tối thiểu <strong>{depositAmount.toLocaleString('vi-VN')} đ</strong>
                                    </div>
                                    <div className="warning-text">
                                        Số dư hiện tại: <strong>{availableBalance.toLocaleString('vi-VN')} đ</strong>
                                    </div>
                                    <button
                                        className="warning-button"
                                        onClick={() => navigate('/deposit')}
                                    >
                                        💳 Nạp tiền ngay
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Bidding Form */}
                        {!isEnded && (
                            <div className="bidding-form">
                                <h3>🎯 Đặt giá của bạn</h3>

                                <button
                                    className="quick-bid-button"
                                    onClick={() => setBidAmount(getQuickBidAmount().toString())}
                                    disabled={!hasEnoughBalance}
                                >
                                    ⚡ Đặt nhanh: {getQuickBidAmount().toLocaleString('vi-VN')} đ
                                </button>

                                <div className="bid-input-group">
                                    <input
                                        type="number"
                                        value={bidAmount}
                                        onChange={(e) => setBidAmount(e.target.value)}
                                        placeholder="Nhập số tiền..."
                                        className="bid-input"
                                        disabled={!hasEnoughBalance}
                                    />
                                    <span className="input-suffix">đ</span>
                                </div>

                                {bidAmount && (
                                    <div className="bid-preview">
                                        {parseFloat(bidAmount).toLocaleString('vi-VN')} đ
                                    </div>
                                )}

                                <button
                                    className="place-bid-button"
                                    onClick={handlePlaceBid}
                                    disabled={!hasEnoughBalance || !bidAmount}
                                >
                                    🔨 Đặt giá ngay
                                </button>

                                <div className="bid-info">
                                    <p>Số tiền {depositAmount.toLocaleString('vi-VN')} đ sẽ bị khóa trong ví khi đặt giá</p>
                                </div>
                            </div>
                        )}

                        {/* Live Bid Feed */}
                        <div className="bid-feed" ref={bidFeedRef}>
                            <h3>📊 Lịch sử đặt giá</h3>
                            {bids.length === 0 ? (
                                <p className="no-bids">Chưa có ai đặt giá</p>
                            ) : (
                                <div className="bid-list">
                                    {bids.map((bid, index) => (
                                        <div
                                            key={bid._id}
                                            className={`bid-item ${index === 0 ? 'bid-leading' : ''} animate-slide-in`}
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <div className="bid-user">
                                                {index === 0 && '👑'} {bid.bidderId?.username || 'Anonymous'}
                                            </div>
                                            <div className="bid-amount">
                                                {bid.amount.toLocaleString('vi-VN')} đ
                                            </div>
                                            <div className="bid-time">
                                                {new Date(bid.createdAt).toLocaleTimeString('vi-VN')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessionalAuctionPage;
