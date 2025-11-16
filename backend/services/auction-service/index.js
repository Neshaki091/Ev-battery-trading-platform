const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8070;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://mongodb:27017/auction-service";

app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Auction-service connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

app.use("/", require("./src/routes/auction.routes"));

app.listen(PORT, () =>
  console.log(`🚀 Auction-service running on port ${PORT}`)
);


