const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const Review = require('../models/review');
const User = require('../models/users');
const { isAdmin } = require('../middleware');

// ------------------------------
// RESOURCE CHECK
// ------------------------------
router.get("/resouce", (req, res) => {
  if (req.user && req.user.role === "user") return res.redirect("/listing");
  res.render(res);
});

// ------------------------------
// ADMIN DASHBOARD
// ------------------------------
router.get("/admin", isAdmin, async (req, res) => {
  const usersCount = await User.countDocuments({ role: "user" });
  const sellersCount = await User.countDocuments({ role: "seller" });
  const listingsCount = await Listing.countDocuments();
  const reviewsCount = await Review.countDocuments();

  const users = await User.find({ role: "user" });
  const sellers = await User.find({ role: "seller" });

  const pendingListings = await Listing.find({ verifiedByAdmin: false })
    .populate("owner");

  res.render("admin/dashboard", {
    usersCount,
    sellersCount,
    listingsCount,
    reviewsCount,
    users,
    sellers,
    pendingListings
  });
});

// ------------------------------
// DELETE USER
// ------------------------------
router.delete("/admin/users/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);

    await Listing.deleteMany({ owner: id });
    await Review.deleteMany({ author: id });

    res.json({ success: true, id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
});

// ------------------------------
// VIEW USER PROFILE
// ------------------------------
router.get("/admin/user/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.redirect("/admin");

    res.render("profile", { currUser: user });
  } catch (err) {
    console.log(err);
    res.redirect("/admin");
  }
});

// ------------------------------
// APPROVE LISTING
// ------------------------------
router.post("/admin/listings/:id/approve", isAdmin, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).send("Listing not found");

    listing.verifiedByAdmin = true;
    listing.status = "approved";
    await listing.save();

    res.redirect("/admin");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// ------------------------------
// REJECT LISTING
// ------------------------------
router.post("/admin/listings/:id/reject", isAdmin, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).send("Listing not found");

    listing.verifiedByAdmin = false;
    listing.status = "rejected";
    await listing.save();

    res.redirect("/admin");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});

// ------------------------------
// APPROVE ALL
// ------------------------------
router.get("/admin/approve-all", isAdmin, async (req, res) => {
  await Listing.updateMany({}, { verifiedByAdmin: true });
  res.redirect("/admin");
});

module.exports = router;
