# --- Stage 1: Build React ---
FROM node:18-alpine as builder
WORKDIR /app

# Copy dependency và cài đặt
COPY package*.json ./
RUN npm install

# Copy code
COPY . .

# Nhận biến môi trường
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build ra thư mục 'dist'
RUN npm run build

# --- Stage 2: Chạy bằng 'serve' (Thay thế Nginx) ---
FROM node:18-alpine

WORKDIR /app

# Cài đặt gói 'serve' toàn cục
RUN npm install -g serve

# Copy thư mục build từ Stage 1 sang
COPY --from=builder /app/dist ./dist

# Mở cổng 5173 (Thay vì 3000)
EXPOSE 5173

# Lệnh chạy server trên cổng 5173
CMD ["serve", "-s", "dist", "-l", "5173"]