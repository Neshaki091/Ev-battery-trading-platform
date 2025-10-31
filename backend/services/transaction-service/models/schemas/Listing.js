const mongoose = require('mongoose');

/**
 * Schema cho tin đăng bán xe/pin
 */
const listingSchema = new mongoose.Schema({
  // Thông tin cơ bản
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  
  description: { 
    type: String,
    trim: true
  },
  
  // Giá và loại
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  
  type: { 
    type: String, 
    enum: ['xe', 'pin'], 
    required: true 
  },
  
  // Người bán
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Thông tin chi tiết
  brand: String,           // Hãng xe/pin
  model: String,           // Model
  year: Number,            // Năm sản xuất
  capacity: String,        // Dung lượng pin (kWh)
  condition: {             // Tình trạng
    type: String,
    enum: ['new', 'like-new', 'good', 'fair'],
    default: 'good'
  },
  
  // Trạng thái
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  
  // Hình ảnh
  images: [String],        // Array URLs hình ảnh
  
  // Địa điểm
  location: {
    city: String,
    district: String,
    address: String
  }
  
}, { 
  timestamps: true // Tự động tạo createdAt, updatedAt
});

// Index để tìm kiếm nhanh
listingSchema.index({ type: 1, status: 1 });
listingSchema.index({ sellerId: 1 });

module.exports = mongoose.model('Listing', listingSchema);