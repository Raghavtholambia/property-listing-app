const Listing = require("../models/listing");
const Review = require("../models/review");



// ➕ Create a Review
module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  listing.reviews.push(newReview);
  await listing.save();
  await newReview.save();

  req.flash("success", "Review added!");
  res.redirect(`/listing/${req.params.id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, revId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: revId } });
  await Review.findByIdAndDelete(revId);

  req.flash("success", "Review deleted!");
  res.redirect(`/listing/${id}`);
};
