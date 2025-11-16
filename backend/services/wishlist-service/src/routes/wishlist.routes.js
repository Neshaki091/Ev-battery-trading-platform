
// wishlist-service/src/routes/wishlist.routes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { authmiddleware } = require('../../shared/authmiddleware');

router.get('/my', authmiddleware, wishlistController.getWishlist);
router.post('/', authmiddleware, wishlistController.addToList);
router.delete('/:listingId', authmiddleware, wishlistController.removeFromList);

module.exports = router;