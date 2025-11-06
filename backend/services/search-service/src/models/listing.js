const mongoose = require('mongoose');

// Schema này CHỈ chứa các trường bạn muốn lưu ở Database B
const ListingSearchSchema = new mongoose.Schema({
    // Trường cơ bản
    title: { type: String, text: true },       // Bật text index để tìm kiếm
    description: { type: String, text: true },  // Bật text index
    price: { type: Number, index: true },      // Bật index để lọc giá
    location: { type: String, index: true },    // Bật index để lọc vị trí
    condition: { type: String, index: true },   // Bật index
    status: { type: String, index: true },      // Bật index
    category: { type: String, index: true },
    
    // ĐÃ THÊM: Các trường chi tiết để lọc
    vehicle_brand: { type: String, index: true }, // Lọc theo brand
    vehicle_model: { type: String, index: true }, // Lọc theo model
    vehicle_manufacturing_year: { type: Number, index: true }, // Lọc theo năm
    vehicle_mileage_km: { type: Number, index: true }, // Lọc theo số km
    battery_capacity_kwh: { type: Number, index: true }, // Lọc theo dung lượng pin
    battery_condition_percentage: { type: Number, index: true }, // Lọc theo tình trạng pin

    // Giữ lại ID tham chiếu (nếu cần)
    vehicle_id: { type: mongoose.Schema.Types.ObjectId },
    battery_id: { type: mongoose.Schema.Types.ObjectId },
}, {
    timestamps: true // GIỮ NGUYÊN: Để sắp xếp tin mới nhất lên đầu
});

// Tạo composite text index (tìm kiếm trên cả title và description)
ListingSearchSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Listing', ListingSearchSchema);