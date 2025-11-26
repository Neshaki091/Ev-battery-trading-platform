// src/controllers/searchController.js

// Import đúng tên từ service (Lưu ý đường dẫn thư mục service hay services)
const { searchListings } = require('../service/searchService'); 

const getListings = async (req, res) => {
    try {
        // 1. Gọi Service
        const result = await searchListings(req.query);

        // 2. Trả về Response
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách tin thành công.',
            data: result.listings,      // Lấy listings từ kết quả service
            pagination: result.pagination // Lấy pagination từ kết quả service
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ nội bộ.',
            error: error.message
        });
    }
};

module.exports = { getListings };