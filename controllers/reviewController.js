const Listing = require("../models/listing");
const Review = require("../models/review");

// ➕ Create a Review
module.exports.createReview = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    // ⭐ Update average rating
    await listing.updateAverageRating();

    req.flash("success", "Review added successfully!");
    res.redirect(`/listing/${req.params.id}`);
  } catch (err) {
    console.error("Error creating review:", err);
    req.flash("error", "Something went wrong while adding the review.");
    res.redirect(`/listing/${req.params.id}`);
  }
};

// ❌ Delete a Review
module.exports.deleteReview = async (req, res) => {
  try {
    const { id, revId } = req.params;

    // Remove the review from the listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: revId } });
    await Review.findByIdAndDelete(revId);

    // ⭐ Update average rating again
    const listing = await Listing.findById(id);
    if (listing) await listing.updateAverageRating();

    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listing/${id}`);
  } catch (err) {
    console.error("Error deleting review:", err);
    req.flash("error", "Something went wrong while deleting the review.");
    res.redirect(`/listing/${id}`);
  }
};
