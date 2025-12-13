// routes/rentals.js
const express = require("express");
const router = express.Router();
const rentalController = require("../controllers/rentalController");
const { isLoggedIn } = require("../middleware");

router.post("/new", isLoggedIn, rentalController.createRental);
router.get("/history", isLoggedIn, rentalController.getRentalHistory);
router.post("/complete/:rentalId", isLoggedIn, rentalController.completeRental);


module.exports = router;
