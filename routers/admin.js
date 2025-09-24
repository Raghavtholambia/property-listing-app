const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const Review = require('../models/review');
const User = require('../models/users');
const { isAdmin } = require('../middleware');

router.get("/resouce",(req,res)=>{
    if(req.user && req.user.role==="user")
        res.redirect("/listing")
    res.render(res )
})



router.get("/admin", isAdmin, async (req, res) => {
  const usersCount = await User.countDocuments({});
  const sellersCount = await User.countDocuments({ role: "seller" });
  const listingsCount = await Listing.countDocuments({});
  const reviewsCount = await Review.countDocuments({});

  const users = await User.find({});
  const sellers = await User.find({ role: "seller" });

  res.render("admin/dashboard", { 
    usersCount, 
    sellersCount, 
    listingsCount, 
    reviewsCount,
    users,
    sellers
  });
});

module.exports = router;
