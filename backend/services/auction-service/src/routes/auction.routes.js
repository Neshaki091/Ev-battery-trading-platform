const express = require("express");
const router = express.Router();

const auctionController = require("../controllers/auction.controller");
const { authmiddleware } = require("../../shared/authmiddleware");
const { allowAdminRole } = require("../../shared/adminMiddleware");

router.get("/auctions", auctionController.listAuctions);
router.get("/auctions/:id", auctionController.getAuctionById);

router.post("/auctions", authmiddleware, auctionController.createAuction);
router.post("/auctions/:id/bids", authmiddleware, auctionController.placeBid);
router.post("/auctions/:id/buy-now", authmiddleware, auctionController.buyNow);
router.patch("/auctions/:id/cancel", authmiddleware, auctionController.cancelAuction);
router.patch(
  "/auctions/:id/settle",
  authmiddleware,
  allowAdminRole,
  auctionController.settleAuction
);

module.exports = router;

