const { model } = require("mongoose");
const express = require('express')
const router = express.Router({ mergeParams: true })
const { listingSchema, reviewSchema } = require('./schema')
const reviews = require("./models/review"); // make sure this is required

const ExpressError=require('./utils/ExpressError.js');

const listing = require("./models/listing.js")


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {

        // to store the information in the in the session of the user try to access url which needs authantication so after login user will redirect to the url 
        req.session.redirectUrl = req.originalUrl;

        req.flash("error", "You must be login to create/edit/delete new listing")
        return res.redirect("/login")
    }
    next()
}
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next()
}

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body)
    if (error) throw new ExpressError(400, error.message);
    else next();
}

module.exports.validateReviews = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body)
    if (error) throw new ExpressError(400, error.message);
    next();
}

module.exports.listingOwner = async (req, res, next) => {
    let { id } = req.params;
    let checkId = await listing.findById(id)
    if (!checkId.owner.equals(res.locals.currUser._id)) {
        req.flash("error","have no access to edit/delete particular listing")
        return res.redirect(`/listing/${id}`)
    }
    next()
}

module.exports.revAuthor = async (req, res, next) => {
    let { id, revId } = req.params;
    let review = await reviews.findById(revId); // Fix variable name from `listing` to `Review`
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "No permission to do that.");
        return res.redirect(`/listing/${id}`);
    }
    next();
};