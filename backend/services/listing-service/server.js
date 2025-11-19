const express = require("express");
const mongoose = require("mongoose");
const listingRoutes = require("./routes/routeslisting.routes");
const { connectRabbitMQ } = require('./util/mqService');
const app = express();
const dotenv = require("dotenv");
dotenv.config();
// Middleware
app.use(express.json());

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
connectRabbitMQ();
// Sử dụng routes
app.use("/", listingRoutes);

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
