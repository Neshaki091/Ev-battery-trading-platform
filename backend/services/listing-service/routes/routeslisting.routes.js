const express = require("express");
const router = express.Router();
const listingController = require("./controllers/controllerslisting.controller");
router.get("/", listingController.getAllListings);

// 🟢 Lấy tin đăng theo ID
router.get("/:id", listingController.getListingById);

// Route tạo tin đăng
router.post("/", listingController.createListing);

// Route sửa tin đănga
router.put("/:id", listingController.updateListing);

module.exports = router;
