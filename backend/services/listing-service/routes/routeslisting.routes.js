const express = require("express");
const router = express.Router();
const listingController = require("../controllers/controllerslisting.controller");
const { authmiddleware } = require("../util/authmiddleware");

// SỬA 1: Import hàm mới
const { getPublicListings, getListingsByOwner, verifyListing } = require("../controllers/controllerslisting.controller");

// --- PUBLIC & CƠ BẢN ---
router.get("/public", getPublicListings); // Lấy tin Active (Public)
router.get("/my", authmiddleware, getListingsByOwner); 
router.get("/:id", listingController.getListingById); // Lấy tin theo ID (Có kiểm tra quyền xem)

// --- CHỨC NĂNG NGƯỜI DÙNG ---
// 🆕 BỔ SUNG: Lấy tin đăng của chính mình (GET /api/listings/my)

router.post("/", authmiddleware, listingController.createListing);
router.put("/:id", authmiddleware, listingController.updateListing);
router.delete("/:id", authmiddleware, listingController.deleteListing);

// --- CHỨC NĂNG ADMIN ---
router.get("/", authmiddleware, listingController.getAllListings); // Tất cả tin (Admin only)
router.put(
    "/:id/approve",
    authmiddleware,
    listingController.approveListing
);
// 🆕 BỔ SUNG: Gắn nhãn kiểm định (PUT /api/listings/:id/verify)
router.put(
    "/:id/verify",
    authmiddleware,
    verifyListing
);

module.exports = router;