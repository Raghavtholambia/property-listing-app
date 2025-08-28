const mongoose = require("mongoose");
const { Schema } = mongoose;

// Subdocument schema for cart items
const cartItemSchema = new Schema({
  product: { 
    type: Schema.Types.ObjectId, 
    ref: "listing", // matches mongoose.model("listing", listingSchema)
    required: true 
  },
  quantity: { 
    type: Number, 
    default: 1,
    min: 1
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  }
});

// Main cart schema
const cartSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: "userSchema", // make sure your users model is actually "User"
    required: true 
  },
  items: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
