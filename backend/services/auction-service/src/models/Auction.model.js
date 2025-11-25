const mongoose = require("mongoose");

const AuctionSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    minBidIncrement: {
      type: Number,
      default: 0,
      min: 0,
    },
    buyNowPrice: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "ended", "cancelled", "settled"],
      default: "scheduled",
      index: true,
    },
    currentPrice: {
      type: Number,
      min: 0,
    },
    winningBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuctionBid",
    },
    bidCount: {
      type: Number,
      default: 0,
    },
    lastBidAt: {
      type: Date,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Deposit requirement for auction participation
    depositRequired: {
      type: Number,
      default: 0,
      min: 0,
      // Số tiền tối thiểu trong ví để tham gia đấu giá
    },
    depositPercentage: {
      type: Number,
      default: 10, // 10% of starting price
      min: 0,
      max: 100,
      // % của giá khởi điểm làm deposit
    },
  },
  { timestamps: true }
);

AuctionSchema.index({ endTime: 1, status: 1 });

AuctionSchema.methods.computeStatus = function () {
  if (this.status === "cancelled" || this.status === "settled") {
    return this.status;
  }
  const now = new Date();
  if (now >= this.endTime) return "ended";
  if (now >= this.startTime) return "active";
  return "scheduled";
};

// Virtual getter for deposit amount
AuctionSchema.virtual('depositAmount').get(function () {
  if (this.depositRequired > 0) {
    return this.depositRequired;
  }
  return Math.floor(this.startingPrice * (this.depositPercentage / 100));
});

// Helper method to get deposit amount
AuctionSchema.methods.getDepositAmount = function () {
  if (this.depositRequired > 0) {
    return this.depositRequired;
  }
  return Math.floor(this.startingPrice * (this.depositPercentage / 100));
};

module.exports = mongoose.model("Auction", AuctionSchema);

