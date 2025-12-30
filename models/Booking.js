const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true
    },

    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
      index: true
    },

    totalPrice: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

/**
 * 🔍 Compound index
 * Improves:
 * - calendar loading
 * - overlap checks
 */
bookingSchema.index({ productId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
