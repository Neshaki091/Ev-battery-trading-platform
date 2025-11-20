# ✅ Casso Webhook Implementation Summary

## 📋 Tổng quan

Webhook endpoint cho Casso đã được **hoàn thiện** trong transaction service. Hệ thống tự động cập nhật trạng thái thanh toán khi nhận được thông báo từ Casso.

---

## 🎯 Những gì đã có sẵn

### 1. Controller - `controllers/cassoController.js`
✅ Đã có đầy đủ logic xử lý webhook:
- Verify HMAC SHA256 signature
- Extract order ID từ description
- Xử lý multiple records trong một webhook
- Error handling đầy đủ

### 2. Service - `services/transactionService.js`
✅ Đã có method `markTransactionPaidFromCasso`:
- Tìm transaction theo order ID
- Cập nhật status: `pending` → `paid`
- Lưu thông tin thanh toán từ Casso
- Validate trạng thái transaction

### 3. Routes - `routes/cassoWebhook.js`
✅ Đã có route definition:
- POST endpoint
- Gọi controller handler

---

## 🔧 Những gì đã được bổ sung

### 1. ✨ Đăng ký route trong `server.js`

**Trước:**
```javascript
// Không có webhook route
app.use('/orders', orderRoutes);
```

**Sau:**
```javascript
// Thêm raw body parser cho webhook
app.use('/webhooks/casso', bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Đăng ký webhook route
app.use('/webhooks/casso', cassoWebhookRoutes);
```

**Lý do:** 
- Cần raw body để verify HMAC signature
- Route chưa được đăng ký trong server

### 2. ✨ Thêm field `cassoPayment` vào Transaction schema

**Trước:**
```javascript
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // ... các field khác
  paidAt: { type: Date }
}, { timestamps: true });
```

**Sau:**
```javascript
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // ... các field khác
  paidAt: { type: Date },
  // 🆕 Thông tin thanh toán từ Casso
  cassoPayment: {
    transId: { type: String },
    description: { type: String },
    amount: { type: Number },
    bankCode: { type: String },
    paidAt: { type: Date },
    raw: { type: mongoose.Schema.Types.Mixed }
  }
}, { timestamps: true });
```

**Lý do:** 
- Service đã sử dụng field này nhưng chưa được định nghĩa trong schema
- Cần lưu trữ thông tin chi tiết từ webhook

### 3. 📚 Tài liệu hướng dẫn

**Đã tạo:**
- ✅ `CASSO_WEBHOOK_SETUP.md` - Hướng dẫn chi tiết cấu hình và sử dụng
- ✅ `test-webhook.js` - Script test webhook nhanh
- ✅ Postman collection - 3 test cases cho webhook
- ✅ Cập nhật README.md với thông tin webhook

---

## 🚀 Cách sử dụng

### Bước 1: Cấu hình environment

Thêm vào `.env`:
```bash
CASSO_WEBHOOK_SECRET=your_secret_from_casso_dashboard
```

### Bước 2: Khởi động service

```bash
cd backend
docker-compose up -d transaction-service
```

### Bước 3: Đăng ký webhook URL trên Casso

Truy cập [Casso Dashboard](https://casso.vn) → Cài đặt → Webhook:

**Webhook URL:**
```
https://your-domain.com/webhooks/casso
```

**Webhook Version:** V2

### Bước 4: Test

**Option 1 - Sử dụng test script:**
```bash
node test-webhook.js 673abc987654321fedcba000 50000000
```

**Option 2 - Import Postman collection:**
- Import file `Transaction-Service.postman_collection.json`
- Chạy folder "5. Casso Webhook"

**Option 3 - Test thực tế:**
1. Tạo order mới
2. Khách hàng chuyển khoản với nội dung: `ORDER#<orderId>`
3. Casso tự động gửi webhook
4. Transaction tự động cập nhật thành `paid`

---

## 📊 Flow hoàn chỉnh

```
1. Khách hàng tạo order
   POST /orders
   → status: "pending"

2. Khách hàng chuyển khoản
   Nội dung: "Thanh toan ORDER#673abc..."
   → Ngân hàng → Casso

3. Casso gửi webhook
   POST /webhooks/casso
   Header: x-casso-signature
   Body: { data: [...] }

4. Transaction Service xử lý
   ✓ Verify signature
   ✓ Extract order ID
   ✓ Update transaction
   → status: "paid"
   → cassoPayment: {...}

5. Response về Casso
   { success: true, data: [...] }
```

---

## 🔒 Bảo mật

### HMAC Signature Verification

```javascript
// Casso tạo signature
signature = HMAC-SHA256(rawBody, secret)

// Server verify
computed = HMAC-SHA256(req.rawBody, CASSO_WEBHOOK_SECRET)
if (computed !== signature) → 401 Unauthorized
```

### Các trường hợp bảo mật

| Tình huống | Response | Lý do |
|------------|----------|-------|
| Signature sai | 401 | Không phải từ Casso |
| Không có signature | 401 | Request không hợp lệ |
| Signature đúng | 200/400 | Xử lý bình thường |

---

## 🧪 Test Cases

### ✅ Test 1: Webhook hợp lệ
- Signature đúng
- Order ID tồn tại
- Status = pending
- **Expected:** 200, transaction → paid

### ✅ Test 2: Signature không hợp lệ
- Signature sai hoặc không có
- **Expected:** 401 Unauthorized

### ✅ Test 3: Không tìm thấy Order ID
- Signature đúng
- Description không chứa ORDER#
- **Expected:** 400, reason: "Không tìm thấy mã order"

### ✅ Test 4: Order đã bị hủy
- Signature đúng
- Order ID tồn tại nhưng status = cancelled
- **Expected:** 400, error: "Giao dịch đã bị hủy"

---

## 📝 Checklist triển khai

- [x] Controller có logic xử lý webhook
- [x] Service có method cập nhật transaction
- [x] Route được định nghĩa
- [x] Route được đăng ký trong server.js
- [x] Raw body parser được cấu hình
- [x] Schema có field cassoPayment
- [x] Environment variable CASSO_WEBHOOK_SECRET
- [x] Tài liệu hướng dẫn
- [x] Test script
- [x] Postman collection
- [ ] Đăng ký webhook URL trên Casso (cần làm thủ công)
- [ ] Test với Casso thực tế (cần môi trường production/staging)

---

## 🎉 Kết luận

Webhook endpoint đã **sẵn sàng sử dụng**! 

Chỉ cần:
1. ✅ Cấu hình `CASSO_WEBHOOK_SECRET`
2. ✅ Đăng ký webhook URL trên Casso dashboard
3. ✅ Test với script hoặc Postman

**Endpoint:** `POST http://localhost:3001/webhooks/casso`

