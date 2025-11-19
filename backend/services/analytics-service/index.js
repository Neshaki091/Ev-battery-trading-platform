
// index.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { startConsumer } = require('./src/consumers/mqConsumer');
const analyticsRoutes = require('./src/routes/analytics.routes');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/analytics_db';

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

// START RABBITMQ CONSUMER
startConsumer();

// ROUTES 
app.use("/", analyticsRoutes); 

// Start Server
app.listen(PORT, () => console.log(`🚀 Analytics Service running on port ${PORT}`));