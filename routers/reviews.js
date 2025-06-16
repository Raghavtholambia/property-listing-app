const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { validateReviews, isLoggedIn, revAuthor } = require("../middleware");

const reviewController = require("../controllers/reviewController");

// ➕ Create Review
router.post(
  "/reviews",
  validateReviews,
  isLoggedIn,
  wrapAsync(reviewController.createReview)
);

// ❌ Delete Review
router.delete(
  "/reviews/:revId/delete",
  isLoggedIn,
  revAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
