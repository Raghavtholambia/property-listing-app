const mongoose = require("mongoose");
const { Schema } = mongoose;

const storeSchema = new Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  shopName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true
  },

  description: String,

  shopBanner: {
    type: String,
    default: "/images/default-shop-banner.jpg",
  },

  shopLogo: {
    type: String,
    default: "/images/default-shop-logo.png",
  },

  address: String,
  phone: String,

  // Shop stats
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },

  // For your coin/badge system
  badge: {
    type: String,
    enum: ["bronze", "silver", "gold", "premium"],
    default: "bronze"
  },

  coins: {
    type: Number,
    default: 0,
  },

}, { timestamps: true });

module.exports = mongoose.model("Store", storeSchema);
