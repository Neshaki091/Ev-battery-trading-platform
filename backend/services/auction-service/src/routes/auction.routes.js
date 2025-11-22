const express = require("express");
const router = express.Router();

const auctionController = require("../controllers/auction.controller");
const { authmiddleware } = require("../../shared/authmiddleware");
const { allowAdminRole } = require("../../shared/adminMiddleware");

router.get("/", auctionController.listAuctions);
router.get("/:id", auctionController.getAuctionById);

router.post("/", authmiddleware, auctionController.createAuction);
router.post("/:id/bids", authmiddleware, auctionController.placeBid);
router.post("/:id/buy-now", authmiddleware, auctionController.buyNow);
router.patch("/:id/cancel", authmiddleware, auctionController.cancelAuction);
router.patch(
  "/:id/settle",
  authmiddleware,
  allowAdminRole,
  auctionController.settleAuction
);

module.exports = router;

