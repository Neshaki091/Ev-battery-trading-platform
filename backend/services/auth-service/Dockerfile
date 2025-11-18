# Base Image
FROM node:18-alpine
WORKDIR /app

# --- FIX LỖI SHARED ---
# 1. Copy thư mục SHARED vào TRƯỚC (Tính từ context 'backend/')
COPY ./shared /app/shared

# --- CÀI ĐẶT RIÊNG CHO SERVICE ---
# 2. Copy package.json của service
COPY ./services/auth-services/package*.json ./

# 3. Cài đặt dependencies
RUN npm install

# 4. Copy code của service đó
COPY ./services/auth-services/ .

# 5. Mở cổng
EXPOSE 3000

# 6. Lệnh khởi động
CMD ["node", "server.js"]