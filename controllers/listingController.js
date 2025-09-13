const Listing = require("../models/listing");
const { cloudinary } = require("../cloudConfig");

module.exports.createListing = async (req, res) => {
  const { category, itemName, description, pricePerDay, city, country } = req.body.listing;

  const newListing = new Listing({
    category,
    itemName,
    description,
    pricePerDay,
    city,
    country,
    owner: req.user._id
  });

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await newListing.save();
  req.flash("success", "New rental item is created");
  res.redirect("/listing");
};


module.exports.getAllListings = async (req, res) => {
  const allListing = await Listing.find();
  res.render("index", { users: allListing });
};

module.exports.renderNewForm = (req, res) => {
  console.log(res.locals.currUser);
  
  if (res.locals.currUser.role !== "admin"&& res.locals.currUser.role !== "seller") {
    req.flash("error","you are not registered as seller");
    res.redirect("/listing");
  }
  else
  res.render("new");
};

module.exports.getSingleListing = async (req, res) => {
  const { id } = req.params;
  const clickListing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!clickListing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listing");
  }

  // ✅ calculate avg rating
  let avgRating = 0;
  if (clickListing.reviews.length > 0) {
    const total = clickListing.reviews.reduce((sum, r) => sum + r.rating, 0);
    avgRating = total / clickListing.reviews.length;
  }

  res.render("Show", { clickListing, avgRating });
};


module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const newListing = await Listing.findById(id);
  res.render("edit", { newListing });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const updatedListing = await Listing.findById(id);
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    if (updatedListing.image?.filename) {
      await cloudinary.uploader.destroy(updatedListing.image.filename);
    }
    updatedListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
    await updatedListing.save();
  }

  req.flash("success", "Successfully edited");
  res.redirect(`/listing/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const listingToDelete = await Listing.findById(id);
  if (listingToDelete.image?.filename) {
    await cloudinary.uploader.destroy(listingToDelete.image.filename);
  }
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully");
  res.redirect("/listing");
};