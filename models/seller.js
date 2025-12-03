const mongoose = require("mongoose");
const { Schema } = mongoose;

const sellerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  gstNumber: {
    type: String,
  },
  shopAddress: {
    type: String,
    required: true,
  },
  city: String,
  state: String,
  country: String,
  pincode: String,
  contactNumber: String,
  businessEmail: String,
  bankAccountNumber: String,
  ifscCode: String,
  businessLogo: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Seller = mongoose.model("Seller", sellerSchema);
module.exports = Seller;
