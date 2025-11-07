const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/users");
const { storage } = require("../cloudConfig"); // ✅ using your Cloudinary setup
const upload = multer({ storage });

// Middleware: Check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// =====================================
// 🧩 ROUTE: VIEW PROFILE PAGE
// =====================================
router.get("/", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render("profile", { currUser: user });
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Internal Server Error");
  }
});

// =====================================
// 🖋️ ROUTE: UPDATE PROFILE DETAILS
// =====================================
router.post("/update-profile", isLoggedIn, async (req, res) => {
  try {
    const { fullName, bio, phone, address } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      fullName,
      bio,
      phone,
      address,
    });

    res.redirect("/profile");
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).send("Internal Server Error");
  }
});

// =====================================
// 🖼️ ROUTE: UPLOAD PROFILE IMAGE (Cloudinary)
// =====================================
router.post("/upload-profile-image", isLoggedIn, upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).send("No file uploaded");
    }

    // ✅ Cloudinary gives us the URL
    const imageUrl = req.file.path;

    await User.findByIdAndUpdate(req.user._id, {
      profileImage: imageUrl,
    });

    res.redirect("/profile");
  } catch (err) {
    console.error("Error uploading profile image:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
