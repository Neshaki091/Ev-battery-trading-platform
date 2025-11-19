# Base Image
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# 1. Copy thư mục SHARED (Nếu analytics-service cần dùng chung code)
# Thay thế tên service nếu khác.
COPY ./shared /app/shared

# 2. Copy package.json của service
# Đảm bảo đã sửa lỗi đường dẫn tuyệt đối
COPY ./services/analytics-service/package*.json ./

# 3. Cài đặt dependencies
RUN npm install

# 4. Copy mã nguồn của service đó
# Đảm bảo chỉ copy mã nguồn từ thư mục services/analytics-service
COPY ./services/analytics-service/ .

# 5. Mở cổng
EXPOSE 3008

# 6. Lệnh khởi động
# Đảm bảo rằng tệp khởi động thực tế là index.js
CMD ["node", "index.js"]