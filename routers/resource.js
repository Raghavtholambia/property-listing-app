const express = require("express");
const router = express.Router();
const {checkRole} = require("../middleware");

router.get("/", checkRole);


module.exports = router;
 