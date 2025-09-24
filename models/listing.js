const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reviews = require('./review');
const listingSchema = new Schema({
  category: {
    type: String,
    enum: ["Accessories", "Electronics", "Home Appliance", "Furniture", "Others"],
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  pricePerDay: {
    type: Number,
    required: true,
  },
  city: String,
  country: String,

  // 🆕 location fields
  latitude: {
    type: Number,
    required: false, // optional for now
  },
  longitude: {
    type: Number,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "reviews",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// delete reviews when listing deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await reviews.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
