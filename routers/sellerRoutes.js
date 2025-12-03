// ======================================================
// SELLER ROUTES (FINAL WORKING VERSION)
// ======================================================

const express = require("express");
const router = express.Router();

const Seller = require("../models/seller");
const Store = require("../models/store");
const User = require("../models/users");

const { isLoggedIn } = require("../middleware");

// ------------------------------------------------------
// GET seller registration page
// ------------------------------------------------------
router.get("/register", isLoggedIn, async (req, res) => {
  const currUser = req.user;

  // Already a seller → go to dashboard
  if (currUser.role === "seller") {
    return res.redirect("/seller/dashboard");
  }

  res.render("sellerRegister", { currUser });
});

// ------------------------------------------------------
// POST seller registration
// ------------------------------------------------------
router.post("/register", isLoggedIn, async (req, res) => {
  try {
    const {
      businessName,
      gstNumber,
      shopAddress,
      city,
      state,
      country,
      pincode,
      contactNumber,
      businessEmail,
      bankAccountNumber,
      ifscCode,
    } = req.body;

    const currUser = req.user;

    // Prevent Duplicate Seller
    const existingSeller = await Seller.findOne({ user: currUser._id });
    if (existingSeller) return res.redirect("/seller/dashboard");

    // 1️⃣ Create Seller Profile
    await Seller.create({
      user: currUser._id,
      businessName,
      gstNumber,
      shopAddress,
      city,
      state,
      country,
      pincode,
      contactNumber,
      businessEmail,
      bankAccountNumber,
      ifscCode,
    });

    // 2️⃣ Create Store
    let slug = businessName.toLowerCase().replace(/\s+/g, "-");

    // If another same slug exists, append unique number
    const slugExists = await Store.findOne({ slug });
    if (slugExists) slug += "-" + Date.now();

    await Store.create({
      owner: currUser._id,
      shopName: businessName,
      slug,
      address: shopAddress,
      phone: contactNumber,
      description: `${businessName} official rental store`,
    });

    // ---------------------------------------------------
    // 3️⃣ Update User Role → seller (correct method)
    // ---------------------------------------------------
currUser.role = "seller";
await currUser.save();

req.login(currUser, (err) => {
  if (err) console.log(err);
  return res.redirect("/seller/dashboard");
});

  } catch (err) {
    console.error("❌ Error registering seller:", err);
    return res.status(500).send("Error registering seller");
  }
});

// ------------------------------------------------------
// SELLER DASHBOARD
// ------------------------------------------------------
router.get("/dashboard", isLoggedIn, async (req, res) => {
  const currUser = req.user;

  if (currUser.role !== "seller") {
    return res.redirect("/profile");
  }

  const seller = await Seller.findOne({ user: currUser._id });
  const store = await Store.findOne({ owner: currUser._id });

  res.render("sellerDashboard", { currUser, seller, store });
});

module.exports = router;
