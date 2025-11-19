# Base Image
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# --- FIX LỖI SHARED (Nếu có code dùng chung) ---
# 1. Copy thư mục SHARED vào TRƯỚC
COPY ./shared /app/shared

# --- CÀI ĐẶT RIÊNG CHO SERVICE ---
# 2. Copy package.json của service
COPY ./services/auth-service/package*.json ./

# 3. Cài đặt dependencies
# Sử dụng cờ --silent để giảm output log
RUN npm install --silent

# 4. Copy code của service đó
# CHỈ copy nội dung từ thư mục services/auth-service vào thư mục làm việc /app
COPY ./services/auth-service/ .

# 5. Mở cổng
EXPOSE 3001

# 6. Lệnh khởi động
# Giờ đây server.js đã có mặt tại /app/server.js
CMD ["node", "server.js"]