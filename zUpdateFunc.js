const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Store = require("./models/store");

mongoose.connect("mongodb://127.0.0.1:27017/rentify")
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log(err));

async function fixListings() {
  const listings = await Listing.find({});

  console.log(`🔍 Found ${listings.length} listings.`);

  for (let listing of listings) {

    // ---------------------------
    // 1️⃣ FIX STORE MISSING
    // ---------------------------
    if (!listing.store) {
      const store = await Store.findOne({ owner: listing.owner });

      if (store) {
        listing.store = store._id;
        console.log(`✔ Store fixed for listing ${listing._id}`);
      } else {
        console.log(`⚠ No store found for owner ${listing.owner}`);
      }
    }

    // ---------------------------
    // 2️⃣ FIX verifiedByAdmin MISSING
    // ---------------------------
    if (listing.verifiedByAdmin === undefined) {
      listing.verifiedByAdmin = false;  // default
      console.log(`✔ verifiedByAdmin added to ${listing._id}`);
    }

    await listing.save();
  }

  console.log("🎉 All listings updated successfully.");
  process.exit();
}

fixListings();
