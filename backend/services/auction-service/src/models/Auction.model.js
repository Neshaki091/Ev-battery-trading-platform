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

module.exports = mongoose.model("Auction", AuctionSchema);

