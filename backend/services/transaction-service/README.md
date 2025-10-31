# Transaction Service

**Chức năng:** Xử lý giao dịch mua bán xe điện/pin

## 🎯 3 Chức năng chính

1. **Tạo Order** - Khách hàng đặt mua hàng
2. **Thanh Toán** - Xử lý thanh toán đơn hàng
3. **Hợp Đồng PDF** - Tạo hợp đồng điện tử chuyên nghiệp

> **Note:** Listing (tin đăng) thuộc `listing-service` riêng

## 📁 Cấu trúc đơn giản

```
transaction-service/
├── controllers/
│   └── orderController.js      # Xử lý HTTP requests
├── services/
│   └── transactionService.js   # Business logic giao dịch
├── models/schemas/
│   ├── User.js
│   ├── Listing.js             # Reference only
│   └── Transaction.js
├── routes/
│   └── orders.js
├── utils/
│   └── pdfGenerator.js
└── server.js
```

## 🚀 Chạy service

```bash
cd backend
docker-compose up -d transaction-service
```

## 📚 API Usage

### 1. Tạo Order (Mua hàng)

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "sellerId": "507f1f77bcf86cd799439022",
    "listingId": "673def123456789abcdef000",
    "price": 50000000,
    "type": "xe"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "673abc987654321fedcba000",
      "userId": "507f1f77bcf86cd799439011",
      "sellerId": "507f1f77bcf86cd799439022",
      "listingId": "673def123456789abcdef000",
      "price": 50000000,
      "type": "xe",
      "status": "pending",
      "createdAt": "2024-10-30T10:00:00.000Z"
    }
  },
  "message": "Tạo order thành công"
}
```

### 2. Thanh Toán

```bash
curl -X POST http://localhost:3000/orders/673abc987654321fedcba000/payment
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "673abc987654321fedcba000",
      "status": "paid",
      "paidAt": "2024-10-30T10:05:00.000Z"
    }
  },
  "message": "Thanh toán thành công"
}
```

### 3. Tải Hợp Đồng PDF

```bash
# Browser
http://localhost:3000/orders/673abc987654321fedcba000/contract

# Download
curl http://localhost:3000/orders/673abc987654321fedcba000/contract -o contract.pdf
```

PDF sẽ bao gồm:
- ✅ Header với logo nền tảng
- ✅ Thông tin hợp đồng (số HD, ngày)
- ✅ Thông tin bên mua & bên bán
- ✅ Bảng chi tiết giao dịch
- ✅ 5 điều khoản hợp đồng
- ✅ Chữ ký điện tử
- ✅ Mã blockchain verification

### 4. Lấy Danh Sách Orders của User

```bash
curl http://localhost:3000/orders/user/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "673abc987654321fedcba000",
        "price": 50000000,
        "type": "xe",
        "status": "paid",
        "createdAt": "2024-10-30T10:00:00.000Z"
      }
    ]
  }
}
```

## 🔄 Flow hoàn chỉnh

```
1. Customer tạo order
   └─> POST /orders
       └─> Status: pending

2. Customer thanh toán
   └─> POST /orders/:id/payment
       └─> Status: paid
       └─> paidAt: timestamp

3. Customer tải hợp đồng
   └─> GET /orders/:id/contract
       └─> Download PDF
```

## 📊 Database Schema

### Transaction (Order)
```javascript
{
  _id: ObjectId,           // Tự động sinh
  userId: ObjectId,        // Người mua
  sellerId: ObjectId,      // Người bán
  listingId: ObjectId,     // Tin đăng (từ listing-service)
  price: Number,           // Giá giao dịch
  type: 'xe' | 'pin',     // Loại sản phẩm
  status: 'pending' | 'paid' | 'completed' | 'cancelled',
  paidAt: Date,            // Ngày thanh toán
  createdAt: Date,         // Tự động
  updatedAt: Date          // Tự động
}
```

## 🛠️ Code Examples

### Trong code
```javascript
const transactionService = require('./services/transactionService');

// Tạo order
const order = await transactionService.createTransaction({
  userId: '507f1f77bcf86cd799439011',
  sellerId: '507f1f77bcf86cd799439022',
  listingId: '673def123456789abcdef000',
  price: 50000000,
  type: 'xe'
});

// Thanh toán
await transactionService.processPayment(order._id);

// Check status
const transaction = await transactionService.getTransactionById(order._id);
console.log(transaction.status); // 'paid'
```

## ⚙️ Config

### Environment Variables
```bash
PORT=3000
MONGODB_URI=mongodb://...
NODE_ENV=development
```

### Docker
```yaml
transaction-service:
  ports:
    - "3000:3000"
  environment:
    - PORT=3000
    - MONGODB_URI=mongodb://...
```

## 🔍 Testing

```bash
# Health check
curl http://localhost:3000/health

# Service info
curl http://localhost:3000/

# Create order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":"507f1f77bcf86cd799439011","sellerId":"507f1f77bcf86cd799439022","listingId":"673def123456789abcdef000","price":50000000,"type":"xe"}'
```

## 🐛 Debug

```bash
# Logs
docker-compose logs -f transaction-service

# MongoDB
docker-compose exec mongodb mongosh -u admin -p evbattery@2024
use evtrading_platform
db.transactions.find()
```

## 📝 Notes

- Order ID tự động sinh bởi MongoDB
- ListingId lấy từ listing-service (service khác)
- PDF chỉ tạo được khi status = 'paid'
- Response format chuẩn: `{ success, data, message }`

## 🔗 Integration với services khác

```
┌─────────────────┐
│ Listing Service │ ← Tạo/quản lý tin đăng
└────────┬────────┘
         │ listingId
         ↓
┌─────────────────────┐
│ Transaction Service │ ← Tạo order, thanh toán, PDF
└─────────────────────┘
```

---

**Transaction Service = Mua hàng + Thanh toán + Hợp đồng 🛒💳📄**
