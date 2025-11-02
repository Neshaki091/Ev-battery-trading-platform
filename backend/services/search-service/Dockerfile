# 1️⃣ Dùng image Node.js chính thức, bản nhỏ gọn
FROM node:18-alpine

# 2️⃣ Đặt thư mục làm việc
WORKDIR /app

# 3️⃣ Copy file package để cài dependency trước (cache tốt hơn)
COPY package*.json ./

# 4️⃣ Cài đặt dependencies (production mode)
RUN npm install --production

# 5️⃣ Copy toàn bộ mã nguồn vào container
COPY . .

# 6️⃣ Mở port mà app sử dụng
EXPOSE 8004

# 7️⃣ Chạy server
CMD ["node", "server.js"]
