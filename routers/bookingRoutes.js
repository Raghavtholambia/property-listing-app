const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookedDates
} = require("../controllers/bookingController");

const { isLoggedIn } = require("../middleware");
// create booking
router.post("/", isLoggedIn, createBooking);

// calendar data
router.get("/listing/:listingId", getBookedDates);

module.exports = router;
