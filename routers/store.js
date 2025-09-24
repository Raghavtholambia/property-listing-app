const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const User = require('../models/users');


router.get("/:id", async (req, res) => {
  const seller = await User.findById(req.params.id);
  console.log(seller);
  
  const listings = await Listing.find({ owner: req.params.id });

  res.render("store", { seller, listings });
});

module.exports=router