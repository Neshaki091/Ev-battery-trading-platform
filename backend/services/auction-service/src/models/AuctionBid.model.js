const mongoose = require("mongoose");

const AuctionBidSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
      index: true,
    },
    bidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

AuctionBidSchema.index({ auctionId: 1, amount: -1 });
AuctionBidSchema.index({ auctionId: 1, createdAt: -1 });

module.exports = mongoose.model("AuctionBid", AuctionBidSchema);

