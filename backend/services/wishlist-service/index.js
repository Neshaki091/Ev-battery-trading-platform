// index.js (Template cho Reports/Wishlist Service)
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/my_service_db';

// MIDDLEWARES
app.use(express.json());

// CONNECT DB
mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });

app.use("/", require('./src/routes/wishlist.routes')); 

// Start Server
app.listen(PORT, () => console.log(`🚀 Service running on port ${PORT}`));