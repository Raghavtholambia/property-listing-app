const Listing = require("../models/listing");
const { cloudinary } = require("../cloudConfig");

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New listing is created");
  res.redirect("/listing");
};

module.exports.getAllListings = async (req, res) => {
  const allListing = await Listing.find();
  res.render("index", { users: allListing });
};

module.exports.renderNewForm = (req, res) => {
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

  res.render("Show", { clickListing });
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
