const Listing = require('../models/listing');

const searchListings = async (params) => {
    const {
        q, category, location, condition,
        price_min, price_max, 
        brand, model, year_min, year_max, mileage_max,
        battery_capacity_min, battery_condition_min,
        
        sort_by = 'newest',
        page = 1,
        limit = 10
    } = params;

    // const query = { status: 'approved' }; // Luôn lọc tin đã được duyệt
    const query = { status: {$in: ["Active", "Sold"]} }; // Luôn lọc tin đã được duyệt

    // --- 1. TÌM KIẾM VĂN BẢN TOÀN BỘ (Text Search) ---
    if (q) {
        query.$text = { $search: q };
    }
    
    // --- 2. LỌC THEO CÁC TRƯỜNG CƠ BẢN ---
    if (category) query.category = category;
    
    // SỬA: Dùng regex để tìm kiếm không phân biệt hoa thường và linh hoạt hơn
    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }
    if (condition) {
        query.condition = { $regex: condition, $options: 'i' };
    }

    // --- 3. LỌC THEO KHOẢNG GIÁ ---
    // SỬA: Loại bỏ logic xung đột, chỉ giữ lại lọc theo khoảng giá
    if (price_min || price_max) {
        query.price = {};
        if (price_min) query.price.$gte = parseInt(price_min);
        if (price_max) query.price.$lte = parseInt(price_max);
    }
    
    // --- 4. LỌC THEO CHI TIẾT XE ---
    // SỬA: Dùng regex cho brand và model để tìm kiếm linh hoạt hơn
    if (brand) {
        query.vehicle_brand = { $regex: brand, $options: 'i' };
    }
    if (model) {
        query.vehicle_model = { $regex: model, $options: 'i' };
    }
    
    if (year_min || year_max) {
        query.vehicle_manufacturing_year = {};
        if (year_min) query.vehicle_manufacturing_year.$gte = parseInt(year_min);
        if (year_max) query.vehicle_manufacturing_year.$lte = parseInt(year_max);
    }
    
    if (mileage_max) {
        query.vehicle_mileage_km = { $lte: parseInt(mileage_max) };
    }

    // --- 5. LỌC THEO CHI TIẾT PIN ---
    if (battery_capacity_min) {
        query.battery_capacity_kwh = { $gte: parseFloat(battery_capacity_min) };
    }
    if (battery_condition_min) {
        query.battery_condition_percentage = { $gte: parseInt(battery_condition_min) };
    }

    // --- 6. LOGIC SẮP XẾP ---
    let sortOptions = {};
    switch (sort_by) {
        case 'price_asc':
            sortOptions.price = 1;
            break;
        case 'price_desc':
            sortOptions.price = -1;
            break;
        case 'relevance': 
            if (q) {
                 sortOptions.score = { $meta: 'textScore' }; 
            } else {
                 sortOptions.createdAt = -1; 
            }
            break;
        case 'newest':
        default: 
            sortOptions.createdAt = -1;
            break;
    }

    // --- 7. PHÂN TRANG VÀ THỰC THI TRUY VẤN ---
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitValue = parseInt(limit);

    try {
        const listings = await Listing.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitValue)
            .exec();

        const total = await Listing.countDocuments(query);

        return {
            total,
            page: parseInt(page),
            limit: limitValue,
            totalPages: Math.ceil(total / limitValue),
            listings
        };
    } catch (error) {
        console.error("Lỗi trong service tìm kiếm:", error);
        throw new Error('Không thể thực hiện tìm kiếm.');
    }
};

module.exports = { searchListings };