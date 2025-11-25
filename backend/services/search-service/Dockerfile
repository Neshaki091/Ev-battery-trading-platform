
# --- STAGE 1: BUILDER ---
# Sử dụng stage này để cài đặt tất cả các dependencies
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc trong builder stage
WORKDIR /usr/src/app

# Chỉ sao chép file package.json và package-lock.json của dịch vụ này
# Điều này giúp Docker caching hiệu quả: chỉ chạy npm install lại khi các file này thay đổi.
COPY ./services/search-service/package*.json ./

# Cài đặt tất cả dependencies (bao gồm devDependencies, nếu cần build)
# Nếu bạn không có bước build nào, bạn có thể chỉ cần chạy npm install --only=production ở đây.
RUN npm install

# Sao chép source code của dịch vụ sau khi cài đặt dependencies
COPY ./services/search-service/. .

# --- STAGE 2: FINAL IMAGE (RUNTIME) ---
# Sử dụng image alpine nhỏ gọn hơn cho môi trường runtime
FROM node:18-alpine

# Thiết lập thư mục làm việc trong image cuối
WORKDIR /app

# Sao chép node_modules (chỉ production dependencies) từ builder stage
COPY --from=builder /usr/src/app/node_modules /app/node_modules

# Sao chép source code (bao gồm server.js) từ builder stage
COPY --from=builder /usr/src/app .

# Mở port
EXPOSE 3003

# Lệnh khởi động ứng dụng
# File server.js bây giờ nằm ở thư mục gốc /app/server.js
CMD ["node", "server.js"]