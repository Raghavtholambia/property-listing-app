const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },

  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  type: {
    type: String,
    enum: [
      "payment-upi",
      "payment-card",
      "payment-cod",
      "refund",
      "coins-used",
      "coins-earned"
    ],
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Transaction", transactionSchema);
