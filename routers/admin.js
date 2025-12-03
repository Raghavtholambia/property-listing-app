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
  const usersCount = await User.countDocuments({role: "user"});
  const sellersCount = await User.countDocuments({ role: "seller" });
  const listingsCount = await Listing.countDocuments({});
  const reviewsCount = await Review.countDocuments({});

  const users = await User.find({role: "user"});
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

// Delete individual user
router.delete("/admin/users/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);

    // Optionally delete related listings/reviews
    await Listing.deleteMany({ owner: id });
    await Review.deleteMany({ author: id });

    res.json({ success: true, id }); // return success + deleted user id
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
});
// ✅ Admin View Any User Profile
router.get("/admin/user/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
     

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin");
    }

    res.render("profile", { currUser: user, apiKey: process.env.GOOGLE_API_KEY });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error loading user profile");
    res.redirect("/admin");
  }
});



module.exports = router;
