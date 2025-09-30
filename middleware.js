const { model } = require("mongoose");
const express = require('express')
const router = express.Router({ mergeParams: true })
const { listingSchema, reviewSchema } = require('./schema')
const reviews = require("./models/review"); // make sure this is required

const ExpressError=require('./utils/ExpressError.js');

const listing = require("./models/listing.js")


// middleware.js
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to continue.");
        // Instead of redirecting to /user/login, go back to home with a query flag
        return res.redirect("/?showLogin=true");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        console.log(req.session.redirectUrl);
        
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
if (!checkId.owner.equals(res.locals.currUser._id) && res.locals.currUser.role !== "admin") {
        req.flash("error","have no access to edit/delete particular listing")
        return res.redirect(`/listing/${id}`)
    }
    next()
}

module.exports.revAuthor = async (req, res, next) => {
    let { id, revId } = req.params;
    let review = await reviews.findById(revId); // Fix variable name from `listing` to `Review`
    if (!review.author.equals(res.locals.currUser._id) && res.locals.currUser.role !== "admin") {
        req.flash("error", "No permission to do that.");
        return res.redirect(`/listing/${id}`);
    }
    next();
};
module.exports.isAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        req.flash("error", "You don't have admin access");
        return res.redirect('/');
    }
    next();
};

// middleware/checkRole.js
module.exports.checkRole=(req, res, next)=> {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  if (req.user.role === "admin") {
    return res.redirect("/admin");
  } else if (req.user.role === "seller") {
    return res.redirect(`/store/${req.user._id}`);
  } else {
    return res.redirect("/"); // normal user → homepage
  }
  next();
}

