// src/services/searchService.js
const Listing = require('../models/listing');

const searchListings = async (params) => {
    const {
        q, type, brand, model, year_min, year_max,
        price_min, price_max, mileage_max,
        battery_capacity_min, battery_condition_min,
        sort_by = 'newest',
        page = 1,
        limit = 10
    } = params;

    const query = { status: 'approved' };

    if (q) {
        query.$text = { $search: q };
    }
    if (type) query.type = type;
    if (brand) query['vehicle.brand'] = brand;
    if (model) query['vehicle.model'] = model;
    if (price_min || price_max) {
        query.price = {};
        if (price_min) query.price.$gte = parseInt(price_min);
        if (price_max) query.price.$lte = parseInt(price_max);
    }
    if (year_min || year_max) {
        query['vehicle.manufacturing_year'] = {};
        if (year_min) query['vehicle.manufacturing_year'].$gte = parseInt(year_min);
        if (year_max) query['vehicle.manufacturing_year'].$lte = parseInt(year_max);
    }
    if (mileage_max) query['vehicle.mileage_km'] = { $lte: parseInt(mileage_max) };
    if (battery_capacity_min) query['battery.capacity_kwh'] = { $gte: parseFloat(battery_capacity_min) };
    if (battery_condition_min) query['battery.condition_percentage'] = { $gte: parseInt(battery_condition_min) };

    let sortOptions = {};
    switch (sort_by) {
        case 'price_asc': sortOptions.price = 1; break;
        case 'price_desc': sortOptions.price = -1; break;
        case 'relevance': sortOptions.score = { $meta: 'textScore' }; break;
        case 'newest':
        default: sortOptions.createdAt = -1; break;
    }

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