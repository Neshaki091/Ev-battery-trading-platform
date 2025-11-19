# Base Image
FROM node:18-alpine
WORKDIR /app

# --- FIX LỖI SHARED ---
# 1. Copy thư mục SHARED vào TRƯỚC
COPY ./shared /app/shared

# --- CÀI ĐẶT RIÊNG CHO SERVICE ---
# 2. Copy package.json của service
COPY ./services/wishlist-service/package*.json ./

# 3. Cài đặt dependencies
RUN npm install

# 4. Copy code của service đó
COPY ./services/wishlist-service/ .

# 5. Mở cổng
EXPOSE 8002

# 6. Lệnh khởi động
CMD ["node", "index.js"]