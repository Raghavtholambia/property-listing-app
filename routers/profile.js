const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/users");
const { storage } = require("../cloudConfig"); // ✅ Cloudinary config
const upload = multer({ storage });

const {isLoggedIn} =require('../middleware')

// Middleware: Check if user is logged in

// =====================================
// 🧩 VIEW PROFILE PAGE
// =====================================
router.get("/", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render("profile", { currUser: user, apiKey: process.env.MAP_API_KEY });
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Internal Server Error");
  }
});

// =====================================
// 🖋️ UPDATE PROFILE DETAILS
// =====================================
router.post("/update-profile", isLoggedIn, async (req, res) => {
  try {
    const { fullName, bio, phone, address, latitude, longitude } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
      fullName,
      bio,
      phone,
      address,
      latitude,
      longitude,
    });

    res.redirect("/profile");
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).send("Internal Server Error");
  }
});

// =====================================
// 🖼️ UPLOAD PROFILE IMAGE (Cloudinary)
// =====================================
router.post(
  "/upload-profile-image",
  isLoggedIn,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file || !req.file.path) {
        return res.status(400).send("No file uploaded");
      }

      const imageUrl = req.file.path;

      await User.findByIdAndUpdate(req.user._id, { profileImage: imageUrl });

      res.redirect("/");
    } catch (err) {
      console.error("Error uploading profile image:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
