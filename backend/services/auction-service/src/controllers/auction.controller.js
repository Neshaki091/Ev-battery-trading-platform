const mongoose = require("mongoose");
const Auction = require("../models/Auction.model");
const AuctionBid = require("../models/AuctionBid.model");
const { publishEvent } = require("../../util/mqService");

// (Các hàm getStatus và syncStatus giữ nguyên)
const getStatus = (auction) => {
  if (!auction) return "cancelled";
  if (auction.status === "cancelled" || auction.status === "settled") {
    return auction.status;
  }
  const now = new Date();
  if (now >= auction.endTime) return "ended";
  if (now >= auction.startTime) return "active";
  return "scheduled";
};

const syncStatus = async (auction, session) => {
  const computed = getStatus(auction);
  if (computed !== auction.status) {
    auction.status = computed;
    const options = session ? { session } : undefined;
    await auction.save(options);
  }
  return auction.status;
};

exports.createAuction = async (req, res) => {
  try {
    // ... (code logic giữ nguyên)
    const {
      listingId,
      title,
      startTime,
      endTime,
      startingPrice,
      minBidIncrement,
      buyNowPrice,
      metadata,
    } = req.body;

    if (!listingId || !startTime || !endTime || startingPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "listingId, startTime, endTime, startingPrice là bắt buộc.",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Thời gian không hợp lệ." });
    }
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "endTime phải lớn hơn startTime.",
      });
    }

    const auction = await Auction.create({
      listingId,
      sellerId: req.user._id,
      title,
      startTime: start,
      endTime: end,
      startingPrice,
      currentPrice: startingPrice,
      minBidIncrement: minBidIncrement || 0,
      buyNowPrice,
      metadata,
    });

    await syncStatus(auction);
    await publishEvent("auction_created", {
      auctionId: auction._id,
      listingId,
      sellerId: req.user._id,
    });

    res.status(201).json({ success: true, data: auction });
  } catch (error) {
    // --- SỬA ĐỔI: Thêm log chi tiết ---
    console.error(
      `[createAuction] Error. Body=${JSON.stringify(req.body)}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Không thể tạo phiên đấu giá.",
      error: error.message,
    });
  }
};

exports.listAuctions = async (req, res) => {
  try {
    // ... (code logic giữ nguyên)
    const {
      status,
      listingId,
      sellerId,
      includeCancelled = "false",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (listingId) filter.listingId = listingId;
    if (sellerId) filter.sellerId = sellerId;
    if (includeCancelled !== "true") filter.status = { $ne: "cancelled" };

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(parseInt(limit, 10) || 10, 50);
    const skip = (pageNumber - 1) * limitNumber;

    const [items, total] = await Promise.all([
      Auction.find(filter)
        .sort({ endTime: 1 })
        .skip(skip)
        .limit(limitNumber),
      Auction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items.map((auction) => ({
        ...auction.toObject(),
        computedStatus: getStatus(auction),
      })),
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalItems: total,
        limit: limitNumber,
      },
    });
  } catch (error) {
    // --- SỬA ĐỔI: Thêm log chi tiết ---
    console.error(
      `[listAuctions] Error. Query=${JSON.stringify(req.query)}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đấu giá.",
      error: error.message,
    });
  }
};

exports.getAuctionById = async (req, res) => {
  try {
    // ... (code logic giữ nguyên)
    const { id } = req.params;
    const auction = await Auction.findById(id).populate("winningBid");
    if (!auction) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiên đấu giá." });
    }
    const bids = await AuctionBid.find({ auctionId: id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        ...auction.toObject(),
        computedStatus: getStatus(auction),
        bids,
      },
    });
  } catch (error) {
    // --- SỬA ĐỔI: Thêm log chi tiết ---
    console.error(`[getAuctionById] Error. ID=${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin phiên đấu giá.",
      error: error.message,
    });
  }
};

exports.placeBid = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    // ... (code logic giữ nguyên)
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Bid amount phải lớn hơn 0." });
    }

    session.startTransaction();
    const auction = await Auction.findById(id).session(session);
    if (!auction) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiên đấu giá." });
    }

    const status = await syncStatus(auction, session);
    if (status !== "active") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Phiên đấu giá chưa bắt đầu hoặc đã kết thúc.",
      });
    }

    if (String(auction.sellerId) === String(req.user._id)) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Người bán không thể tự đặt giá.",
      });
    }

    const currentPrice = auction.currentPrice ?? auction.startingPrice;
    const minRequired = currentPrice + (auction.minBidIncrement || 0);
    if (amount < minRequired) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Giá đặt phải lớn hơn hoặc bằng ${minRequired}.`,
      });
    }

    const [bid] = await AuctionBid.create(
      [
        {
          auctionId: auction._id,
          bidderId: req.user._id,
          amount,
        },
      ],
      { session }
    );

    auction.currentPrice = amount;
    auction.lastBidAt = new Date();
    auction.bidCount += 1;
    auction.winningBid = bid._id;
    await auction.save({ session });

    await session.commitTransaction();
    await publishEvent("auction_bid_placed", {
      auctionId: auction._id,
      bidderId: req.user._id,
      amount,
      bidId: bid._id,
    });

    res.status(201).json({
      success: true,
      data: {
        auctionId: auction._id,
        amount,
        bid,
      },
    });
  } catch (error) {
    await session.abortTransaction().catch(() => { });
    // --- SỬA ĐỔI: Thêm log chi tiết ---
    console.error(
      `[placeBid] Error. ID=${req.params.id}, Body=${JSON.stringify(
        req.body
      )}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: "Không thể đặt giá.",
      error: error.message,
    });
  } finally {
    session.endSession().catch(() => { });
  }
};

exports.buyNow = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    // ... (code logic giữ nguyên)
    const { id } = req.params;

    session.startTransaction();
    const auction = await Auction.findById(id).session(session);
    if (!auction) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiên đấu giá." });
    }

    const status = await syncStatus(auction, session);
    if (!auction.buyNowPrice) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Phiên đấu giá không hỗ trợ mua ngay.",
      });
    }

    if (status !== "active" && status !== "scheduled") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Phiên đấu giá đã kết thúc hoặc bị hủy.",
      });
    }

    if (String(auction.sellerId) === String(req.user._id)) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Người bán không thể tự mua phiên đấu giá của mình.",
      });
    }

    const [bid] = await AuctionBid.create(
      [
        {
          auctionId: auction._id,
          bidderId: req.user._id,
          amount: auction.buyNowPrice,
        },
      ],
      { session }
    );

    auction.currentPrice = auction.buyNowPrice;
    auction.lastBidAt = new Date();
    auction.bidCount += 1;
    auction.winningBid = bid._id;
    auction.status = "ended";
    auction.endTime = new Date();
    await auction.save({ session });

    await session.commitTransaction();
    await publishEvent("auction_buy_now", {
      auctionId: auction._id,
      bidderId: req.user._id,
      amount: auction.buyNowPrice,
      bidId: bid._id,
    });

    res.status(200).json({
      success: true,
      data: {
        auctionId: auction._id,
        amount: auction.buyNowPrice,
        bid,
      },
    });
  } catch (error) {
    await session.abortTransaction().catch(() => { });
    // --- SỬA ĐỔI: Thêm log chi tiết ---
    console.error(`[buyNow] Error. ID=${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Không thể thực hiện mua ngay.",
      error: error.message,
    });
  } finally {
    session.endSession().catch(() => { });
  }
};

exports.cancelAuction = async (req, res) => {
  try {
    // ... (code logic giữ nguyên)
    const { id } = req.params;
    const auction = await Auction.findById(id);
    if (!auction) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiên đấu giá." });
    }

    const isOwner = String(auction.sellerId) === String(req.user._id);
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền hủy phiên đấu giá này.",
      });
    }

    const status = getStatus(auction);
    if (status === "ended" || status === "settled") {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy phiên đấu giá đã kết thúc.",
      });
    }

    auction.status = "cancelled";
    await auction.save();
    await publishEvent("auction_cancelled", {
      auctionId: auction._id,
      listingId: auction.listingId,
    });

    res.json({ success: true, data: auction });
  } catch (error) {
    // --- SỬA ĐỔI: Thêm log chi tiết ---
    console.error(`[cancelAuction] Error. ID=${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Không thể hủy phiên đấu giá.",
      error: error.message,
    });
  }
};

exports.settleAuction = async (req, res) => {
  try {
    // ... (code logic giữ nguyên)
    const { id } = req.params;
    const auction = await Auction.findById(id);
    if (!auction) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiên đấu giá." });
    }

    const status = getStatus(auction);
    if (status !== "ended") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể chốt phiên đấu giá đã kết thúc.",
      });
    }

    auction.status = "settled";
    await auction.save();
    await publishEvent("auction_settled", {
      auctionId: auction._id,
      listingId: auction.listingId,
      winningBid: auction.winningBid,
    });

    res.json({ success: true, data: auction });
  } catch (error) {
    // --- SỬA ĐỔI: Thêm log chi tiết ---
    console.error(`[settleAuction] Error. ID=${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: "Không thể chốt phiên đấu giá.",
      error: error.message,
    });
  }
};