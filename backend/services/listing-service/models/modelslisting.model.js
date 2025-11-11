const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema(
  {
    // --- TRƯỜNG CƠ BẢN VÀ BẮT BUỘC ---
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      trim: true,
      required: true, // Thêm required cho title
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      enum: ["New", "Used", "Refurbished"],
      default: "Used",
    },
    status: {
      type: String,
      enum: ["Active", "Pending", "Sold", "Hidden",],
      default: "Pending",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["Vehicle", "Battery", "Other"],
      default: "Other",
    },
    images: [
      {
        type: String,
      },
    ],

    // --- TRƯỜNG LIÊN KẾT (Dành cho việc Fetch dữ liệu chi tiết) ---
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: function() { return this.category === 'Vehicle'; } // Bắt buộc nếu là Vehicle
    },
    battery_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Battery",
      required: function() { return this.category === 'Battery'; } // Bắt buộc nếu là Battery
    },

    // --- TRƯỜNG TÌM KIẾM CHI TIẾT (Được sao chép từ Schema Search) ---
    // Mục tiêu: Giảm thiểu việc Search Service phải liên kết lại Listing Service
    // Các trường này nên được điền khi tạo/cập nhật Listing.
    vehicle_brand: { type: String, trim: true }, 
    vehicle_model: { type: String, trim: true }, 
    vehicle_manufacturing_year: { type: Number }, 
    vehicle_mileage_km: { type: Number }, 
    battery_capacity_kwh: { type: Number }, 
    battery_condition_percentage: { type: Number }, 

  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", ListingSchema);