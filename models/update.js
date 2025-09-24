const mongoose = require("mongoose");
const Listing = require("./listing");
const User = require("./users");

(async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/test");

    // sabhi owners ke IDs nikal lo jo Listing me hai
    const listings = await Listing.find().populate("owner");

    const ownerIds = listings.map((listing) => listing.owner?._id).filter(Boolean);

    // un owners ka username update kar do
    await User.updateMany(
      { _id: { $in: ownerIds } },
      { $set: { username: "poornima seller" } }
    );

    console.log("✅ All listing owners updated to 'poornima seller'");
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
})();
