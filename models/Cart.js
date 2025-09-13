const mongoose = require("mongoose");
const { Schema } = mongoose;

// ----------------------
// Cart Item Schema
// ----------------------
const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Listing", // make sure your model name matches
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  price: {
    type: Number, // price per day (from Listing)
    required: true,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  rentalDays: {
    type: Number,
    default: 1,
  },
  total: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// ✅ Always recalc rental days + total before saving an item
cartItemSchema.pre("save", function (next) {
  if (this.startDate && this.endDate) {
    const days = Math.ceil(
      (this.endDate - this.startDate) / (1000 * 60 * 60 * 24)
    );
    this.rentalDays = days > 0 ? days : 1; // at least 1 day
  } else {
    this.rentalDays = 1;
  }

  this.total = this.price * this.quantity * this.rentalDays;
  next();
});

// ----------------------
// Cart Schema
// ----------------------
const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [cartItemSchema],
  grandTotal: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// ✅ Always recalc grand total before saving cart
cartSchema.pre("save", function (next) {
  this.grandTotal = this.items.reduce((acc, item) => acc + item.total, 0);
  next();
});

// ✅ Helper method (call manually after updates)
cartSchema.methods.recalculateTotals = function () {
  this.items.forEach(item => {
    if (item.startDate && item.endDate) {
      const days = Math.ceil(
        (item.endDate - item.startDate) / (1000 * 60 * 60 * 24)
      );
      item.rentalDays = days > 0 ? days : 1;
    } else {
      item.rentalDays = 1;
    }
    item.total = item.price * item.quantity * item.rentalDays;
  });

  this.grandTotal = this.items.reduce((acc, item) => acc + item.total, 0);
};




module.exports = mongoose.model("Cart", cartSchema);
