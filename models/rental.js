const mongoose = require("mongoose");
const { Schema } = mongoose;

const rentalSchema = new Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    days: {
      type: Number,
      required: true,
      min: 1,
    },

    pricePerDay: {
      type: Number,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "completed", "cancelled"],
      default: "pending",
    },

    coinsEarned: {
      sc: { type: Number, default: 0 },
      pc: { type: Number, default: 0 },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rental", rentalSchema);
