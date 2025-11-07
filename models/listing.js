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
  latitude: Number,
  longitude: Number,
  address: String,

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

  // ⭐ New field for average rating
  averageRating: {
    type: Number,
    default: 0,
  },
});

// delete reviews when listing deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await reviews.deleteMany({ _id: { $in: listing.reviews } });
  }
});

listingSchema.methods.updateAverageRating = async function () {
  await this.populate("reviews");
  if (!this.reviews.length) {
    this.averageRating = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = (total / this.reviews.length).toFixed(1);
  }
  await this.save();
};


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
