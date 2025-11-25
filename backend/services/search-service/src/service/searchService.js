const Listing = require('../models/listing'); // Đảm bảo import

/**
 * Helper để tạo query $in linh hoạt cho các trường văn bản
 * (ví dụ: ?brand=vinfast,datbike)
 */
const buildRegexInQuery = (value) => {
    // Tách chuỗi bằng dấu phẩy, trim khoảng trắng
    const arr = value.split(',').map(item => item.trim()).filter(Boolean);
    // Tạo một mảng các biểu thức regex (không phân biệt hoa-thường)
    return { $in: arr.map(item => new RegExp(item, 'i')) };
};

/**
 * Helper để tạo query $in cho các trường khớp chính xác
 * (ví dụ: ?category=xe,pin)
 */
const buildExactInQuery = (value) => {
    const arr = value.split(',').map(item => item.trim()).filter(Boolean);
    return { $in: arr };
};

exports.getPublicListings = async (req, res) => {
    try {
        // Lấy tất cả tham số từ req.query
        const {
            q,
            // Filters (hỗ trợ nhiều giá trị)
            category, location, condition, brand, model,
            // Filters (range)
            price_min, price_max,
            year_min, year_max, mileage_max,
            battery_capacity_min, battery_condition_min,
            // Filters (mới)
            is_verified, // 'true' hoặc 'false'
            posted_within, // số ngày (ví dụ: 7, 30)
            // Sorting & Pagination
            sort_by = 'newest',
            page = 1,
            limit = 10
        } = req.query;

        const query = { status: { $in: ["Active", "Sold"] } };

        // --- 1. LỌC TÌM KIẾM VĂN BẢN (Full-text search) ---
        if (q) {
            // Yêu cầu phải tạo text index trên các trường (xem ghi chú)
            query.$text = { $search: q };
        }

        // --- 2. LỌC LINH HOẠT (Regex & $in) ---
        if (category) query.category = buildExactInQuery(category);
        if (location) query.location = buildRegexInQuery(location);
        if (condition) query.condition = buildRegexInQuery(condition);
        if (brand) query.vehicle_brand = buildRegexInQuery(brand);
        if (model) query.vehicle_model = buildRegexInQuery(model);

        // --- 3. LỌC THEO KHOẢNG SỐ (CÓ VALIDATION) ---

        // Giá
        const pMin = parseInt(price_min);
        const pMax = parseInt(price_max);
        if (!isNaN(pMin) || !isNaN(pMax)) {
            query.price = {};
            if (!isNaN(pMin)) query.price.$gte = pMin;
            if (!isNaN(pMax)) query.price.$lte = pMax;
        }

        // Năm sản xuất
        const yMin = parseInt(year_min);
        const yMax = parseInt(year_max);
        if (!isNaN(yMin) || !isNaN(yMax)) {
            query.vehicle_manufacturing_year = {};
            if (!isNaN(yMin)) query.vehicle_manufacturing_year.$gte = yMin;
            if (!isNaN(yMax)) query.vehicle_manufacturing_year.$lte = yMax;
        }

        // Odo
        const mMax = parseInt(mileage_max);
        if (!isNaN(mMax)) query.vehicle_mileage_km = { $lte: mMax };

        // Pin
        const bcMin = parseFloat(battery_capacity_min);
        if (!isNaN(bcMin)) query.battery_capacity_kwh = { $gte: bcMin };

        const bcoMin = parseInt(battery_condition_min);
        if (!isNaN(bcoMin)) query.battery_condition_percentage = { $gte: bcoMin };


        // --- 4. LỌC MỚI (Boolean & Ngày) ---
        if (is_verified === 'true') {
            query.is_verified = true;
        }

        const days = parseInt(posted_within);
        if (!isNaN(days) && days > 0) {
            // Lấy các tin đăng được tạo trong X ngày qua
            query.createdAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
        }

        // --- 5. LOGIC SẮP XẾP ---
        let sortOptions = {};
        let projection = {}; // Chuẩn bị projection

        switch (sort_by) {
            case 'price_asc': sortOptions.price = 1; break;
            case 'price_desc': sortOptions.price = -1; break;
            case 'relevance':
                if (q) {
                    sortOptions.score = { $meta: 'textScore' };
                    projection.score = { $meta: 'textScore' }; // BẮT BUỘC PHẢI THÊM
                } else {
                    sortOptions.createdAt = -1; // Fallback nếu không có 'q'
                }
                break;
            case 'newest':
            default:
                sortOptions.createdAt = -1;
                break;
        }

        // --- 6. PHÂN TRANG VÀ THỰC THI TRUY VẤN ---
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitValue = parseInt(limit);

        const listings = await Listing.find(query)
            .project(projection) // Thêm projection
            .sort(sortOptions)
            .skip(skip)
            .limit(limitValue)
            .exec();

        const total = await Listing.countDocuments(query);

        // --- 7. Trả về kết quả ---
        res.status(200).json({
            success: true,
            data: listings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limitValue),
                totalItems: total,
                limit: limitValue
            }
        });

    } catch (error) {
        console.error("Lỗi trong getPublicListings:", error);
        res.status(500).json({ message: 'Không thể thực hiện tìm kiếm.' });
    }
};
