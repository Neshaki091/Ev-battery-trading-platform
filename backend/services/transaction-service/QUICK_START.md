# 🚀 Quick Start - Casso Webhook

## ⚡ 3 Bước để bắt đầu

### 1️⃣ Cấu hình Secret Key

```bash
# Tạo file .env trong thư mục transaction-service
echo "CASSO_WEBHOOK_SECRET=your_secret_from_casso" > .env
```

**Lấy secret key:**
1. Đăng nhập [Casso.vn](https://casso.vn)
2. Vào **Cài đặt** → **Webhook**
3. Copy **Secret Key**

---

### 2️⃣ Khởi động Service

```bash
cd backend
docker-compose up -d transaction-service
```

**Kiểm tra service đang chạy:**
```bash
curl http://localhost:3001/orders/history
```

---

### 3️⃣ Test Webhook

**Option A - Dùng script có sẵn (Khuyến nghị):**
```bash
cd backend/services/transaction-service
node test-webhook.js <order-id> <amount>

# Ví dụ:
node test-webhook.js 673abc987654321fedcba000 50000000
```

**Option B - Dùng Postman:**
1. Import file `Transaction-Service.postman_collection.json`
2. Set environment variable `CASSO_WEBHOOK_SECRET`
3. Chạy folder **"5. Casso Webhook"**

**Option C - Curl thủ công:**
```bash
SECRET="your_secret_key"
BODY='{"data":[{"id":"trans_123","amount":50000000,"description":"ORDER#673abc987654321fedcba000"}]}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)

curl -X POST http://localhost:3001/webhooks/casso \
  -H "Content-Type: application/json" \
  -H "x-casso-signature: $SIG" \
  -d "$BODY"
```

---

## 📋 Checklist

- [ ] Đã có secret key từ Casso
- [ ] Đã tạo file .env với CASSO_WEBHOOK_SECRET
- [ ] Service đang chạy (port 3001)
- [ ] Test webhook thành công với script
- [ ] Đăng ký webhook URL trên Casso dashboard

---

## 🔗 Webhook URL

**Local (dùng ngrok):**
```
https://abc123.ngrok.io/webhooks/casso
```

**Production:**
```
https://api.yourdomain.com/webhooks/casso
```

**Cấu hình trên Casso:**
- Webhook Version: **V2**
- URL: Điền URL ở trên
- Secret: Tự động match với CASSO_WEBHOOK_SECRET

---

## 💡 Tips

### Format nội dung chuyển khoản

✅ **Đúng:**
- `ORDER#673abc987654321fedcba000`
- `Thanh toan ORDER#673abc987654321fedcba000`
- `order#673abc987654321fedcba000 mua xe`

❌ **Sai:**
- `673abc987654321fedcba000` (thiếu ORDER#)
- `ORDER 673abc987654321fedcba000` (thiếu #)
- `ORDER#123` (không đủ 24 ký tự)

### Kiểm tra logs

```bash
# Xem logs real-time
docker-compose logs -f transaction-service

# Xem 100 dòng cuối
docker-compose logs --tail=100 transaction-service
```

### Kiểm tra database

```bash
# Vào MongoDB shell
docker-compose exec mongodb mongosh

# Chọn database
use transaction_db

# Xem transactions
db.transactions.find().pretty()

# Tìm transaction theo ID
db.transactions.findOne({_id: ObjectId("673abc987654321fedcba000")})
```

---

## 🆘 Troubleshooting

### Lỗi 401 - Unauthorized
```
❌ Chữ ký không hợp lệ
```
**Giải pháp:** Kiểm tra CASSO_WEBHOOK_SECRET có đúng không

### Lỗi 400 - Bad Request
```
❌ Không tìm thấy mã order trong nội dung chuyển khoản
```
**Giải pháp:** Đảm bảo description có format `ORDER#<24-hex-chars>`

### Lỗi 404 - Not Found
```
❌ Không tìm thấy giao dịch từ mã order
```
**Giải pháp:** Order ID không tồn tại trong database

### Service không chạy
```bash
# Restart service
docker-compose restart transaction-service

# Rebuild nếu cần
docker-compose up -d --build transaction-service
```

---

## 📚 Tài liệu đầy đủ

- 📖 [CASSO_WEBHOOK_SETUP.md](./CASSO_WEBHOOK_SETUP.md) - Hướng dẫn chi tiết
- 📊 [WEBHOOK_IMPLEMENTATION_SUMMARY.md](./WEBHOOK_IMPLEMENTATION_SUMMARY.md) - Tổng quan implementation
- 📝 [README.md](./README.md) - Tài liệu service

---

## ✅ Expected Results

**Khi test thành công, bạn sẽ thấy:**

```json
{
  "success": true,
  "data": [
    {
      "success": true,
      "orderId": "673abc987654321fedcba000",
      "transactionId": "673abc987654321fedcba000"
    }
  ]
}
```

**Trong database, transaction sẽ có:**
- `status`: `"paid"` (thay vì `"pending"`)
- `paidAt`: Timestamp
- `cassoPayment`: Object chứa thông tin từ webhook

---

## 🎉 Done!

Webhook đã sẵn sàng! Giờ bạn có thể:
1. ✅ Nhận thông báo tự động khi khách chuyển khoản
2. ✅ Tự động cập nhật trạng thái thanh toán
3. ✅ Lưu trữ đầy đủ thông tin giao dịch

**Next steps:**
- Đăng ký webhook URL trên Casso dashboard
- Test với giao dịch thực tế
- Monitor logs để đảm bảo hoạt động ổn định

