const express = require("express");
const router = express.Router();

// SỬA 1: Chỉ import controller object, không import lẻ
const listingController = require("../controllers/controllerslisting.controller");
const { authmiddleware } = require("../shared/authmiddleware");
const { allowAdminOrInternal } = require("../util/allowAdminOrInternal");
const { allowAdminRole } = require("../shared/adminMiddleware");

// --- PUBLIC & CƠ BẢN ---
// SỬA 2: Dùng listingController.functionName cho nhất quán
router.get("/public", listingController.getPublicListings);
router.get("/my", authmiddleware, listingController.getListingsByOwner);
router.get("/:id", authmiddleware, listingController.getListingById);

// --- CHỨC NĂNG NGƯỜI DÙNG ---

// === BỔ SUNG: Route cho AI Gợi ý giá ===
router.post("/suggest-price", authmiddleware, listingController.suggestPrice);

router.post("/", authmiddleware, listingController.createListing);
router.put("/:id", authmiddleware, listingController.updateListing);
router.delete("/:id", authmiddleware, listingController.deleteListing);

// --- CHỨC NĂNG ADMIN ---
// SỬA 2: Dùng listingController.functionName
router.get("/", authmiddleware,allowAdminRole, listingController.getAllListings);
router.put(
    "/:id/approve",
    authmiddleware,allowAdminRole,
    listingController.approveListing
);
router.put(
    "/:id/verify",
    authmiddleware,
    allowAdminRole,
    listingController.verifyListing
);
router.put(
    "/:id/status",
    allowAdminOrInternal,
    listingController.updateListingStatus
);


module.exports = router;