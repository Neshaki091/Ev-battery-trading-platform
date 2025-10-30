// src/controllers/searchController.js

const { searchListings } = require('../service/searchService');

const getListings = async (req, res) => {
    try {
        // Gọi hàm từ service để xử lý logic tìm kiếm
        const results = await searchListings(req.query);

        // Trả về kết quả thành công
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách tin thành công.',
            data: results
        });
    } catch (error) {
        // Trả về lỗi nếu có
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = { getListings };