const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const Review = require('../models/review');
const User = require('../models/users');
const { isAdmin } = require('../middleware');

router.get('/admin', isAdmin, async (req, res) => {
    const usersCount = await User.countDocuments({});
    const listingsCount = await Listing.countDocuments({});
    const reviewsCount = await Review.countDocuments({});
    
    res.render('admin/dashboard', { usersCount, listingsCount, reviewsCount });
});

module.exports = router;
