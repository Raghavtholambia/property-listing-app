const mongoose = require("mongoose");
const { Schema } = mongoose;
const User = require("./users");

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

  slug: { type: String, unique: true },

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

  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },

  badge: {
    type: String,
    enum: ["Bronze", "Silver", "Gold", "Platinum"],
    default: "Bronze",
  },

  shopCoins: {
    type: Number,
    default: 0,
  },

  promotionPoints: {
    type: Number,
    default: 0,
  } 

}, { timestamps: true });


// CLEANUP MIDDLEWARE — delete stores whose owner is missing
storeSchema.post("find", async function (stores) {
  const Store = this.model;
  const User = mongoose.model("User");

  for (let store of stores) {
    try {
      if (!store.owner) {
        await Store.findOneAndDelete({ _id: store._id });
        console.log(`⛔ Deleted Store ${store._id} — owner missing`);
        continue;
      }

      const userExists = await User.exists({ _id: store.owner });

      if (!userExists) {
        await Store.findOneAndDelete({ _id: store._id });
        console.log(`⛔ Deleted Store ${store._id} — owner not found`);
      }
    } catch (err) {
      console.log("Error deleting invalid store:", err);
    }
  }
});




module.exports = mongoose.model("Store", storeSchema);
