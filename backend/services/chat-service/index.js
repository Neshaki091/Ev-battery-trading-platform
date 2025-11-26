// index.js
const express = require("express");
const dotenv = require("dotenv");
const chatRoutes = require('./routes/chat.routes');
const { db } = require('./util/firebase');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8087;

app.use(express.json());

// Test Firebase connection
if (db) {
    console.log("✅ Firebase Firestore connected successfully");
} else {
    console.error("❌ Firebase Firestore connection failed");
    process.exit(1);
}

// ROUTES
app.use("/", chatRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", service: "chat-service" });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Chat Service running on port ${PORT}`));


