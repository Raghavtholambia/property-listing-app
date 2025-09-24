const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");

// 🔍 Search Route
router.get("/", async (req, res) => {
  try {
    const { q } = req.query; // get search query from ?q= in URL

    if (!q) {
      req.flash("error", "Please enter something to search!");
      return res.redirect("/");
    }

    // Find items where name OR category matches (case insensitive)
    const listings = await Listing.find({
      $or: [
        { itemName: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    });

    if (listings.length === 0) {
      req.flash("error", "No matching results found.");
      return res.redirect("/");
    }

    res.render("index", { listings, q });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong with search!");
    res.redirect("/");
  }
});

module.exports = router;
