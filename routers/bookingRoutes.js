const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const lockController = require("../controllers/lockController");
const {isLoggedIn} = require("../middleware");

router.get("/listing/:listingId", bookingController.getBookedDates);
router.post("/create", isLoggedIn, bookingController.createBooking);

router.post("/lock-dates", isLoggedIn, lockController.lockDates);
router.post("/unlock-dates", isLoggedIn, lockController.unlockDates);

module.exports = router;
