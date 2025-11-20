# 🔔 Casso Webhook Setup Guide

## 📋 Tổng quan

Webhook Casso tự động cập nhật trạng thái thanh toán khi khách hàng chuyển khoản vào tài khoản ngân hàng của bạn.

## 🎯 Cách hoạt động

```
┌─────────────┐      Chuyển khoản      ┌──────────┐
│  Khách hàng │ ──────────────────────> │ Ngân hàng│
└─────────────┘                         └────┬─────┘
                                             │
                                             │ Thông báo
                                             ↓
                                        ┌─────────┐
                                        │  Casso  │
                                        └────┬────┘
                                             │
                                             │ Webhook POST
                                             ↓
                                   ┌──────────────────────┐
                                   │ Transaction Service  │
                                   │ /webhooks/casso      │
                                   └──────────────────────┘
                                             │
                                             │ Cập nhật DB
                                             ↓
                                   ┌──────────────────────┐
                                   │ Transaction Status   │
                                   │ pending → paid       │
                                   └──────────────────────┘
```

## 🔧 Cấu hình

### 1. Thiết lập biến môi trường

Thêm vào file `.env` hoặc Docker environment:

```bash
CASSO_WEBHOOK_SECRET=your_secret_key_here
```

**Lấy secret key từ đâu?**
- Đăng nhập vào [Casso.vn](https://casso.vn)
- Vào **Cài đặt** → **Webhook**
- Copy **Secret Key**

### 2. Đăng ký Webhook URL trên Casso

Truy cập Casso Dashboard và cấu hình:

**Webhook URL:**
```
https://your-domain.com/webhooks/casso
```

Hoặc nếu đang test local với ngrok:
```
https://abc123.ngrok.io/webhooks/casso
```

**Webhook Version:** V2

## 📝 Cách sử dụng

### Bước 1: Tạo Order

```bash
POST /orders
{
  "listingId": "673def123456789abcdef000",
  "type": "xe"
}
```

Response:
```json
{
  "success": true,
  "order": {
    "_id": "673abc987654321fedcba000",
    "status": "pending",
    "price": 50000000
  }
}
```

### Bước 2: Khách hàng chuyển khoản

**Nội dung chuyển khoản PHẢI chứa mã order:**

```
Thanh toan ORDER#673abc987654321fedcba000
```

Hoặc:

```
ORDER#673abc987654321fedcba000 mua xe
```

**Lưu ý:** 
- Mã order phải có format: `ORDER#<24-ký-tự-hex>`
- Không phân biệt hoa thường

### Bước 3: Webhook tự động cập nhật

Khi Casso nhận được thông báo từ ngân hàng, nó sẽ gửi webhook:

```bash
POST /webhooks/casso
Headers:
  x-casso-signature: <HMAC-SHA256-signature>
  Content-Type: application/json

Body:
{
  "data": [
    {
      "id": "trans_123456",
      "amount": 50000000,
      "description": "Thanh toan ORDER#673abc987654321fedcba000",
      "bank_short_name": "VCB",
      "when": "2024-11-18T10:30:00Z"
    }
  ]
}
```

Transaction service sẽ:
1. ✅ Verify chữ ký HMAC
2. ✅ Extract mã order từ description
3. ✅ Cập nhật transaction status: `pending` → `paid`
4. ✅ Lưu thông tin thanh toán vào `cassoPayment`

## 🔒 Bảo mật

### Signature Verification

Webhook sử dụng HMAC SHA256 để xác thực:

```javascript
const signature = crypto
  .createHmac('sha256', CASSO_WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');
```

Nếu signature không khớp → trả về `401 Unauthorized`

## 🧪 Testing

### Test với curl (cần tính signature)

```bash
# 1. Tạo signature
SECRET="your_secret_key"
BODY='{"data":[{"id":"trans_123","amount":50000000,"description":"ORDER#673abc987654321fedcba000"}]}'
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)

# 2. Gửi request
curl -X POST http://localhost:3001/webhooks/casso \
  -H "Content-Type: application/json" \
  -H "x-casso-signature: $SIGNATURE" \
  -d "$BODY"
```

### Test response

**Success:**
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

**Error - Không tìm thấy order:**
```json
{
  "success": false,
  "data": [
    {
      "success": false,
      "reason": "Không tìm thấy mã order trong nội dung chuyển khoản",
      "record": {...}
    }
  ]
}
```

## 📊 Database Schema

Transaction sau khi webhook cập nhật:

```javascript
{
  "_id": "673abc987654321fedcba000",
  "status": "paid",
  "paidAt": "2024-11-18T10:30:00Z",
  "cassoPayment": {
    "transId": "trans_123456",
    "description": "Thanh toan ORDER#673abc987654321fedcba000",
    "amount": 50000000,
    "bankCode": "VCB",
    "paidAt": "2024-11-18T10:30:00Z",
    "raw": { /* full webhook payload */ }
  }
}
```

## 🐛 Troubleshooting

### Webhook không hoạt động?

1. **Kiểm tra secret key:**
   ```bash
   echo $CASSO_WEBHOOK_SECRET
   ```

2. **Kiểm tra logs:**
   ```bash
   docker-compose logs -f transaction-service
   ```

3. **Test signature verification:**
   - Đảm bảo raw body được lưu đúng
   - Secret key phải khớp với Casso

4. **Kiểm tra format mã order:**
   - Phải có `ORDER#` prefix
   - Theo sau là 24 ký tự hex (MongoDB ObjectId)

### Lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|------|-------------|-----------|
| 401 Unauthorized | Signature không hợp lệ | Kiểm tra CASSO_WEBHOOK_SECRET |
| 400 Bad Request | Không tìm thấy order | Kiểm tra format nội dung CK |
| 500 Internal Error | Lỗi database | Kiểm tra MongoDB connection |

## 📚 Tài liệu tham khảo

- [Casso API Documentation](https://docs.casso.vn/)
- [Webhook V2 Guide](https://docs.casso.vn/webhook-v2)

