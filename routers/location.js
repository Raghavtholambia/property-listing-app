const express = require("express");
const router = express.Router();
const Location = require("../models/location");

// Save user/seller location
router.post("/save", async (req, res) => {
  try {
    const { userId, address, latitude, longitude } = req.body;

    let location = await Location.findOne({ user: userId });
    if (location) {
      // update if already exists
      location.address = address;
      location.latitude = latitude;
      location.longitude = longitude;
      await location.save();
    } else {
      location = new Location({ user: userId, address, latitude, longitude });
      await location.save();
    }

    res.json({ success: true, location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving location" });
  }
});

// Get all sellers near a user
router.get("/nearby", async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query; // meters

    // Find sellers and calculate distance using MongoDB geoNear (if you index)
    const sellers = await Location.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          distanceField: "dist.calculated",
          maxDistance: parseInt(maxDistance),
          spherical: true
        }
      },
      {
        $lookup: {
          from: "userschemas", // Mongo collection name (your model is "userSchema")
          localField: "user",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      { $match: { "userDetails.role": "seller" } }
    ]);

    res.json(sellers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching nearby sellers" });
  }
});

module.exports = router;
