// routes/redeem.js
const express = require("express");
const router = express.Router();
const redeemController = require("../controllers/redeemController");
const { isLoggedIn } = require("../middleware");
const badgeController = require("./badgeController");


router.post("/redeem", isLoggedIn, redeemController.redeemItem);

module.exports = router;
