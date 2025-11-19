# --- STAGE 1: BUILDER ---
# Sử dụng stage này để cài đặt tất cả các dependencies của dịch vụ
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc tạm thời
WORKDIR /usr/src/app

# Chỉ sao chép file package.json và package-lock.json của dịch vụ 'transaction-service'
# Điều này tối ưu hóa việc sử dụng Docker cache.
COPY ./services/transaction-service/package*.json ./

# Cài đặt chỉ các dependencies cần thiết cho môi trường sản phẩm (production)
RUN npm install --only=production

# Sao chép source code của dịch vụ vào thư mục làm việc tạm thời
COPY ./services/transaction-service/. .

# --- STAGE 2: FINAL IMAGE (RUNTIME) ---
# Sử dụng image alpine nhỏ gọn hơn cho môi trường runtime cuối cùng
FROM node:18-alpine

# Thiết lập thư mục làm việc chính của ứng dụng
WORKDIR /app

# Sao chép node_modules (chỉ production dependencies) từ builder stage
COPY --from=builder /usr/src/app/node_modules /app/node_modules

# Sao chép source code (bao gồm server.js) từ builder stage vào thư mục gốc /app
COPY --from=builder /usr/src/app .

# Mở port theo yêu cầu (3004)
EXPOSE 3004

# Lệnh khởi động ứng dụng
# File server.js bây giờ đã nằm chính xác tại /app/server.js
CMD ["node", "server.js"]