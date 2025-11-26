import api from './api';

// SỬA ĐỔI: Đã bỏ dấu {} để hàm return promise
export const fetchAuctions = (params = {}) =>
  api.get('/auctions', { params }).then((res) => res.data);

export const fetchAuctionById = (auctionId) =>
  api.get(`/auctions/${auctionId}`).then((res) => res.data);

export const createAuction = (payload) =>
  api.post('/auctions', payload).then((res) => res.data);

export const placeBid = (auctionId, amount) =>
  api
    .post(`/auctions/${auctionId}/bids`, { amount })
    .then((res) => res.data);

export const buyNow = (auctionId) =>
  api.post(`/auctions/${auctionId}/buy-now`).then((res) => res.data);

export const cancelAuction = (auctionId) =>
  api.patch(`/auctions/${auctionId}/cancel`).then((res) => res.data);

export const settleAuction = (auctionId) =>
  api.patch(`/auctions/${auctionId}/settle`).then((res) => res.data);