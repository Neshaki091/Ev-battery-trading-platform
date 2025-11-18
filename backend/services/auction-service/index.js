const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8070;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://mongodb:20017/auction-service";

// SỬA ĐỔI: Thêm log để biết biến môi trường đã nhận đúng chưa
console.log(`[Config] Auction Service PORT: ${PORT}`);
console.log(`[Config] Auction Service MONGO_URI: ${MONGO_URI}`);

app.use(express.json());

// SỬA ĐỔI: Logic kết nối database với cơ chế tự động kết nối lại (retry)
const connectWithRetry = () => {
  console.log("Attempting MongoDB connection...");
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("✅ Auction-service connected to MongoDB");
    })
    .catch((err) => {
      console.error(
        `❌ MongoDB connection error: ${err.message}. Retrying in 5 seconds...`
      );
      // Bỏ process.exit(1) và thay bằng retry
      setTimeout(connectWithRetry, 5000);
    });
};

// Gọi hàm kết nối
connectWithRetry();

// KHÔNG CẦN CHỜ DB, KHỞI ĐỘNG SERVER NGAY
app.listen(PORT, () =>
  console.log(`🚀 Auction-service running on port ${PORT}`)
);

// BIND route
app.use("/", require("./src/routes/auction.routes"));