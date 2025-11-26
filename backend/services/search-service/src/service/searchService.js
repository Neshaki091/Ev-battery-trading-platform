// src/service/searchService.js
const Listing = require('../models/listing'); // Đảm bảo đường dẫn đúng tới Model

/**
 * Helper: Tạo query $in linh hoạt cho các trường văn bản
 */
const buildRegexInQuery = (value) => {
    const arr = value.split(',').map(item => item.trim()).filter(Boolean);
    return { $in: arr.map(item => new RegExp(item, 'i')) };
};

/**
 * Helper: Tạo query $in cho các trường khớp chính xác
 */
const buildExactInQuery = (value) => {
    const arr = value.split(',').map(item => item.trim()).filter(Boolean);
    return { $in: arr };
};

/**
 * Hàm chính: Xử lý logic tìm kiếm
 * Nhận vào: queryParams (là req.query từ controller)
 * Trả về: Object chứa data và pagination
 */
const searchListings = async (queryParams) => {
    const {
        q,
        // Filters
        category, location, condition, brand, model,
        // Ranges
        price_min, price_max,
        year_min, year_max, mileage_max,
        battery_capacity_min, battery_condition_min,
        // Others
        is_verified, posted_within,
        // Sorting & Pagination
        sort_by = 'newest',
        page = 1,
        limit = 10
    } = queryParams;

    const query = { status: { $in: ["Active", "Sold"] } };

    // --- 1. LỌC TÌM KIẾM VĂN BẢN ---
    if (q) query.$text = { $search: q };

    // --- 2. LỌC LINH HOẠT ---
    if (category) query.category = buildExactInQuery(category);
    if (location) query.location = buildRegexInQuery(location);
    if (condition) query.condition = buildRegexInQuery(condition);
    if (brand) query.vehicle_brand = buildRegexInQuery(brand);
    if (model) query.vehicle_model = buildRegexInQuery(model);

    // --- 3. LỌC THEO KHOẢNG SỐ ---
    const pMin = parseInt(price_min), pMax = parseInt(price_max);
    if (!isNaN(pMin) || !isNaN(pMax)) {
        query.price = {};
        if (!isNaN(pMin)) query.price.$gte = pMin;
        if (!isNaN(pMax)) query.price.$lte = pMax;
    }

    const yMin = parseInt(year_min), yMax = parseInt(year_max);
    if (!isNaN(yMin) || !isNaN(yMax)) {
        query.vehicle_manufacturing_year = {};
        if (!isNaN(yMin)) query.vehicle_manufacturing_year.$gte = yMin;
        if (!isNaN(yMax)) query.vehicle_manufacturing_year.$lte = yMax;
    }

    const mMax = parseInt(mileage_max);
    if (!isNaN(mMax)) query.vehicle_mileage_km = { $lte: mMax };

    const bcMin = parseFloat(battery_capacity_min);
    if (!isNaN(bcMin)) query.battery_capacity_kwh = { $gte: bcMin };

    const bcoMin = parseInt(battery_condition_min);
    if (!isNaN(bcoMin)) query.battery_condition_percentage = { $gte: bcoMin };

    // --- 4. LỌC KHÁC ---
    if (is_verified === 'true') query.is_verified = true;

    const days = parseInt(posted_within);
    if (!isNaN(days) && days > 0) {
        query.createdAt = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }

    // --- 5. SẮP XẾP ---
    let sortOptions = {};
    let projection = {};

    switch (sort_by) {
        case 'price_asc': sortOptions.price = 1; break;
        case 'price_desc': sortOptions.price = -1; break;
        case 'relevance':
            if (q) {
                sortOptions.score = { $meta: 'textScore' };
                projection.score = { $meta: 'textScore' };
            } else {
                sortOptions.createdAt = -1;
            }
            break;
        case 'newest':
        default:
            sortOptions.createdAt = -1;
            break;
    }

    // --- 6. THỰC THI ---
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitValue = parseInt(limit);

    const listings = await Listing.find(query)
        .select(projection)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitValue)
        .exec();

    const total = await Listing.countDocuments(query);

    return {
        listings,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limitValue),
            totalItems: total,
            limit: limitValue
        }
    };
};

// EXPORT QUAN TRỌNG: Phải export dạng Object
module.exports = { searchListings };