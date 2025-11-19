
// wishlist-service/src/models/WishlistItem.model.js
const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
    userId: { 
        type: String, // ID của User
        required: true, 
        index: true 
    },
    listingId: { 
        type: String, // ID của Listing
        required: true, 
        index: true 
    },
}, { timestamps: true });

// 💡 UNIQUE INDEX: Đảm bảo mỗi User chỉ có 1 Listing trong Wishlist
wishlistItemSchema.index({ userId: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model('WishlistItem', wishlistItemSchema);