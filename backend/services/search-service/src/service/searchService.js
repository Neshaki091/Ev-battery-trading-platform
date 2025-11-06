const Listing = require('../models/listing');

const searchListings = async (params) => {
    // Đã thêm các tham số lọc mới
    const {
        q, category, location, condition,
        price_min, price_max, 
        brand, model, year_min, year_max, mileage_max,
        battery_capacity_min, battery_condition_min,
        
        sort_by = 'newest',
        page = 1,
        limit = 10
    } = params;

    const query = { status: 'approved' }; // Luôn lọc tin đã được duyệt

    // --- XÂY DỰNG QUERY LỌC ---
    
    // 1. Lọc tìm kiếm văn bản
    if (q) {
        query.$text = { $search: q };
    }
    
    // 2. Lọc theo trường cơ bản
    if (category) query.category = category;
    if (location) query.location = location;
    if (condition) query.condition = condition;

    if (location) {
    query.location = { $regex: `^${location}$`, $options: 'i' };
    }


    // 3. Lọc theo giá (Range)
    if (price_min || price_max) {
        query.price = {};
        if (price_min) query.price.$gte = parseInt(price_min);
        if (price_max) query.price.$lte = parseInt(price_max);
    }
    
    if (params.price) {
    query.price = parseInt(params.price);
    }

// 4. Lọc theo Vehicle Details (Sử dụng tên trường phẳng mới)
    //if (brand) query.vehicle_brand = brand;
    // search bằng regex không phân biệt hoa thường
    if (brand) {
    // SỬ DỤNG $regex VÀ $options: 'i' LÀ ĐỦ
    query.vehicle_brand = { $regex: `^${brand}$`, $options: 'i' };
    }

    if (model) query.vehicle_model = model;
    
    if (year_min || year_max) {
        query.vehicle_manufacturing_year = {};
        if (year_min) query.vehicle_manufacturing_year.$gte = parseInt(year_min);
        if (year_max) query.vehicle_manufacturing_year.$lte = parseInt(year_max);
    }
    
    if (mileage_max) query.vehicle_mileage_km = { $lte: parseInt(mileage_max) };

    // 5. Lọc theo Battery Details (Sử dụng tên trường phẳng mới)
    if (battery_capacity_min) {
        query.battery_capacity_kwh = { $gte: parseFloat(battery_capacity_min) };
    }
    if (battery_condition_min) {
        query.battery_condition_percentage = { $gte: parseInt(battery_condition_min) };
    }


    // --- LOGIC SẮP XẾP (Đề xuất tin mới lên đầu) ---
    let sortOptions = {};
    switch (sort_by) {
        case 'price_asc': sortOptions.price = 1; break;
        case 'price_desc': sortOptions.price = -1; break;
        case 'relevance': 
            // Chỉ sắp xếp theo relevance nếu có tìm kiếm văn bản (q)
            if (q) {
                 sortOptions.score = { $meta: 'textScore' }; 
            } else {
                 sortOptions.createdAt = -1; // Nếu không có q, mặc định là mới nhất
            }
            break;
        case 'newest': // Đây là yêu cầu "Đề xuất những tin mới lên đầu"
        default: 
            sortOptions.createdAt = -1; // Mới nhất lên đầu
            break;
    }

    // --- PHÂN TRANG VÀ THỰC THI TRUY VẤN ---
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