const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema(
  {
    listing_id: {
      type: String,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    battery_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Battery",
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      enum: ["New", "Used", "Refurbished"],
      default: "Used",
    },
    status: {
      type: String,
      enum: ["Active", "Pending", "Sold", "Hidden"],
      default: "Active",
    },
    category: {
      type: String,
      enum: ["Vehicle", "Battery", "Other"],
      default: "Other",
    },
    images: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", ListingSchema);