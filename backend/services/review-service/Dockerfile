# Base Image
FROM node:18-alpine
WORKDIR /app

# --- FIX LỖI SHARED ---
# 1. Copy thư mục SHARED vào TRƯỚC
COPY ./shared /app/shared

# --- CÀI ĐẶT RIÊNG CHO SERVICE ---
# 2. Copy package.json của service
COPY ./services/review-service/package*.json ./

# 3. Cài đặt dependencies
RUN npm install

# 4. Copy code của service đó
COPY ./services/review-service/ .

# 5. (Giả sử) Generate Prisma client nếu cần
RUN npx prisma generate

# 6. Mở cổng
EXPOSE 8000

# 7. Lệnh khởi động
CMD ["/bin/sh", "-c", "npx prisma db push && npm start"]