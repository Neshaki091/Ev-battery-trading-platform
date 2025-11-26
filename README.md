⚡ EV Trade PlatformNền tảng giao dịch xe điện & pin qua sử dụngCấu trúc theo mô hình Monorepo gồm backend (microservices), frontend (web + mobile) và thư mục dùng chung.

| Thành phần | Môi trường | Link truy cập | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | Production / Staging | `(https://web.evbtranding.site/)` | Web ReactJS cho người dùng |
| **Mobile App** | Android (APK) | `đang cập nhật` | App Flutter |
| **API Gateway** | Production | `(https://api.evbtranding.site/api/)` | Endpoint chính cho FE gọi vào |

---

## 🏗 Cấu trúc thư mục
ev-trade-platform/
│
├── backend/
│   ├── gateway/
│   ├── services/
│   │   ├── auth-service/
│   │   ├── listing-service/
│   │   ├── search-service/
│   │   ├── transaction-service/
│   │   └── review-service/
│   │   ├── report-service/      
│   │   ├── wishlist-service/   
│   │   ├── analytics-service/   
│   │   ├── chat-service/        
│   │   └── auction-service/   
│   ├── shared/ #middleware dùng chung 
│   └── docker-compose.yml
│
├── frontend/
│   ├── web/ # React / Next.js
│   └── mobile/ # Flutter / React Native
│
├── shared/ # code, types, utils dùng chung
│
└── README.md
🌱 Các nhánh chính (branches)BranchMục đíchmainBản ổn định, đã kiểm thửdevelopNhánh phát triển tổngauth-serviceMicroservice xác thực người dùnglisting-serviceCRUD tin đăng xe/pinsearch-serviceTìm kiếm, lọc, gợi ýtransaction-serviceGiao dịch, thanh toán, hợp đồngreview-servicesĐánh giá bài đăngreport-servicesBáo cáo bài đăng, người dùnganalytics-serviceThống kêchat-servicesNhắn tin giữa người bán và người muaauction-servicesĐấu giágatewayAPI Gatewayfrontend-webGiao diện web (React / Next.js)frontend-mobileApp Android (Flutter / React Native)🚀 Cách clone và làm việcBash# Clone project
git clone https://github.com/Neshaki091/ev-trade-platform.git
cd ev-trade-platform

# Checkout branch tương ứng
git checkout auth-service      # ví dụ làm phần Auth

# Làm việc trong thư mục tương ứng
cd backend/services/auth-service
# code ở đây

# Commit và push
git add .
git commit -m "feat: add register/login API"
git push origin auth-service
🧠 Quy ước commitfeat: – thêm tính năngfix: – sửa lỗichore: – cấu hình, dọn dẹpdocs: – tài liệu, READMEtest: – thêm/sửa test⚠️ Quy tắc chungKhông commit trực tiếp vào main hoặc developMỗi người làm đúng branch của mìnhPull trước khi push (git pull origin <branch>)Merge qua pull request để review code
