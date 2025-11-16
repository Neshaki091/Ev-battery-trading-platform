# ⚡ EV Trade Platform

Nền tảng giao dịch xe điện & pin qua sử dụng  
Cấu trúc theo mô hình **Monorepo** gồm backend (microservices), frontend (web + mobile) và thư mục dùng chung.

---

## 🏗 Cấu trúc thư mục

```bash
ev-trade-platform/
│
├── backend/
│ ├── gateway/
│ ├── services/
│ │ ├── auth-service/
│ │ ├── listing-service/
│ │ ├── search-service/
│ │ ├── transaction-service/
│ │ ├── review-service/
│ │ ├── report-service/
│ │ ├── wishlist-service/
│ │ ├── analytics-service/
│ │ ├── chat-service/
│ │ └── auction-service/
│ │ └── review-service/
| │ ├── report-service/      <-- MỚI
| │ ├── wishlist-service/    <-- MỚI
│ | ├── analytics-service/   <-- MỚI
│ | ├── chat-service/        <-- MỚI
│ | └── auction-service/     <-- MỚI
| |
│ ├── shared/ #middleware dùng chung 
│ └── docker-compose.yml
│
├── frontend/
│ ├── web/ # React / Next.js
│ └── mobile/ # Flutter / React Native
│
└── README.md
```

---

## 🌱 Các nhánh chính (branches)

| Branch | Mục đích |
|--------|-----------|
| `main` | Bản ổn định, đã kiểm thử |
| `develop` | Nhánh phát triển tổng |
| `auth-service` | Microservice xác thực người dùng |
| `listing-service` | CRUD tin đăng xe/pin |
| `search-service` | Tìm kiếm, lọc, gợi ý |
| `transaction-service` | Giao dịch, thanh toán, hợp đồng |
| `review-service` | Đánh giá bài đăng |
| `report-service` | Báo cáo bài đăng, người dùng |
| `wishlist-service` | Danh sách yêu thích |
| `analytics-service` | Thống kê |
| `chat-service` | Nhắn tin giữa người bán và người mua |
| `auction-service` | Đấu giá |
| `gateway` | API Gateway |
| `frontend-web` | Giao diện web (React / Next.js) |
| `frontend-mobile` | App Android (Flutter / React Native) |

---

## 🚀 Cách clone và làm việc

```bash
# Clone project
git clone https://github.com/Neshaki091/ev-trade-platform.git
cd ev-trade-platform

# Checkout branch tương ứng
git checkout auth-service     # ví dụ làm phần Auth

# Làm việc trong thư mục tương ứng
cd backend/services/auth-service
# code ở đây

# Commit và push
git add .
git commit -m "feat: add register/login API"
git push origin auth-service
```

## 🧠 Quy ước commit
- `feat:` – thêm tính năng
- `fix:` – sửa lỗi
- `chore:` – cấu hình, dọn dẹp
- `docs:` – tài liệu, README
- `test:` – thêm/sửa test

## ⚠️ Quy tắc chung
- Không commit trực tiếp vào main hoặc develop
- Mỗi người làm đúng branch của mình
- Pull trước khi push (git pull origin <branch>)
- Merge qua pull request để review code

