
// wishlist-service/src/controllers/wishlist.controller.js
const WishlistItem = require('../models/WishlistItem.model');
const { publishEvent } = require('../../util/mqService');

// 1. Lấy tất cả tin yêu thích của User (GET /wishlist/my)
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const items = await WishlistItem.find({ userId }).sort({ createdAt: -1 });
        
        // Trả về danh sách listingId để Frontend gọi Listing Service lấy thông tin chi tiết
        const listingIds = items.map(item => item.listingId);
        
        res.status(200).json({ success: true, count: items.length, data: listingIds });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Thêm tin vào danh sách (POST /wishlist)
exports.addToList = async (req, res) => {
    try {
        const userId = req.user._id;
        const { listingId } = req.body;
        
        if (!listingId) {
            return res.status(400).json({ message: 'listingId is required' });
        }

        const newItem = await WishlistItem.create({ userId, listingId });
        
        // Publish event to RabbitMQ for analytics service
        try {
            await publishEvent('wishlist_item_added', {
                listingId: listingId,
                userId: userId
            });
        } catch (error) {
            console.error('Error publishing wishlist_item_added event:', error.message);
        }
        
        res.status(201).json({ success: true, message: 'Added to wishlist', data: newItem });
    } catch (error) {
        // Xử lý lỗi trùng lặp (E11000 Duplicate Key Error)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Listing already exists in your wishlist' });
        }
        res.status(500).json({ message: error.message });
    }
};

// 3. Xóa tin khỏi danh sách (DELETE /wishlist/:listingId)
exports.removeFromList = async (req, res) => {
    try {
        const userId = req.user._id;
        const listingId = req.params.listingId;
        
        const deletedItem = await WishlistItem.findOneAndDelete({ userId, listingId });

        if (!deletedItem) {
            return res.status(404).json({ message: 'Listing not found in your wishlist' });
        }

        res.status(200).json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};