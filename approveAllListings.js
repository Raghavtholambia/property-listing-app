const mongoose = require("mongoose");
const Listing = require("./models/listing");

mongoose.connect("mongodb://127.0.0.1:27017/YOUR_DB_NAME")
  .then(async () => {
    console.log("Connected!");

    await Listing.updateMany({}, { verifiedByAdmin: true });

    console.log("All listings have been verified by admin!");
    mongoose.connection.close();
  })
  .catch(err => console.log(err));
