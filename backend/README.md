# Backend - EV Battery Trading Platform

## 🏗️ Kiến trúc Microservices

```
backend/
├── gateway/              # API Gateway
├── services/
│   ├── auth-service/     # Xác thực & phân quyền
│   ├── listing-service/  # Quản lý tin đăng
│   ├── search-service/   # Tìm kiếm & gợi ý
│   ├── transaction-service/  # Giao dịch & thanh toán ✅
│   └── admin-service/    # Quản trị hệ thống
├── shared/               # Middleware, utils dùng chung
└── docker-compose.yml    # Cấu hình Docker
```

## 🚀 Chạy với Docker

### Khởi động tất cả services

```bash
cd backend
docker-compose up -d
```

### Khởi động service cụ thể

```bash
# Chỉ chạy MongoDB + Redis
docker-compose up -d mongodb redis

# Chạy transaction-service
docker-compose up -d transaction-service
```

### Xem logs

```bash
# Tất cả services
docker-compose logs -f

# Service cụ thể
docker-compose logs -f transaction-service
```

### Dừng services

```bash
docker-compose down

# Dừng và xóa volumes (reset database)
docker-compose down -v
```
## 🔧 Environment Variables

Các biến môi trường đã được cấu hình sẵn trong `docker-compose.yml`:

```yaml
MONGODB_URI: mongodb://admin:evbattery@2024@mongodb:27017/evtrading_platform?authSource=admin
REDIS_HOST: redis
REDIS_PORT: 6379
REDIS_PASSWORD: evbattery@2024
```

## 🧪 Test API

### Transaction Service (Port 3000)

```bash
# Health check
curl http://localhost:3000/health

# Tạo order
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "sellerId": "seller456",
    "listingId": "listing789",
    "price": 50000000,
    "type": "xe"
  }'

# Thanh toán (thay {orderId})
curl -X POST http://localhost:3000/orders/{orderId}/payment

# Tải hợp đồng PDF
curl http://localhost:3000/orders/{orderId}/contract -o contract.pdf
```

## 📦 Database

### Kết nối MongoDB

```bash
# Qua Docker
docker-compose exec mongodb mongosh -u admin -p evbattery@2024

# Trực tiếp
mongosh mongodb://admin:evbattery@2024@localhost:27017/evtrading_platform?authSource=admin
```

### Collections

- `users` - Thông tin người dùng
- `listings` - Tin đăng xe/pin
- `transactions` - Giao dịch
- `reviews` - Đánh giá
- `appointments` - Lịch hẹn xem xe

## 🛠️ Development

### Thêm service mới

1. Tạo thư mục service trong `services/`
2. Thêm cấu hình trong `docker-compose.yml`
3. Uncomment phần service tương ứng
4. Build và chạy: `docker-compose up -d {service-name}`

### Shared modules

Đặt code dùng chung trong `shared/`:
- Middleware (auth, validation, error handling)
- Utils (helpers, constants)
- Types (TypeScript definitions)

## 🔍 Monitoring

```bash
# Xem status containers
docker-compose ps

# Xem resource usage
docker stats

# Inspect network
docker network inspect backend_evbattery-network
```

## 📚 Tài liệu API

Mỗi service có documentation riêng:
- Transaction Service: [docs/transaction-service.md](docs/transaction-service.md)
- Auth Service: [docs/auth-service.md](docs/auth-service.md) (TODO)
- Listing Service: [docs/listing-service.md](docs/listing-service.md) (TODO)

## 🤝 Quy trình làm việc

1. Checkout branch service của bạn
2. Code trong thư mục service tương ứng
3. Test local với Docker
4. Commit và push lên branch
5. Tạo Pull Request để review

---

**Backend Team - EV Battery Trading Platform**

