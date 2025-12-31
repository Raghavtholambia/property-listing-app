const express = require("express");
const router = express.Router();
const lockController = require("../controllers/lockController");

// 🚨 TEMP: NO AUTH while debugging
router.post("/lock-dates", lockController.lockDates);
router.post("/unlock-dates", lockController.unlockDates);

module.exports = router;
