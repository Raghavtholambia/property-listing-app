// require("dotenv").config();

const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, validateListing, listingOwner } = require("../middleware");

const listingController = require("../controllers/listingController");

// All listings
router.get("/", wrapAsync(listingController.getAllListings));

// New form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Create listing
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);

// Show single listing
router.get("/:id", wrapAsync(listingController.getSingleListing));

// Edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  listingOwner,
  wrapAsync(listingController.renderEditForm)
);

// Update listing
router.put(
  "/:id",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  listingOwner,
  wrapAsync(listingController.updateListing)
);

// Delete listing
router.delete(
  "/:id",
  isLoggedIn,
  listingOwner,
  wrapAsync(listingController.deleteListing)
);

module.exports = router;
