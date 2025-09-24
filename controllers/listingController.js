const Listing = require("../models/listing");
const { cloudinary } = require("../cloudConfig");
const googleApiKey = process.env.GOOGLE_API_KEY;


module.exports.createListing = async (req, res) => {
  const {
    category,
    itemName,
    description,
    pricePerDay,
    city,
    country,
    latitude,
    longitude,
    address
  } = req.body.listing;

  const newListing = new Listing({
    category,
    itemName,
    description,
    pricePerDay,
    city,
    country,
    latitude,
    longitude,
    address,
    owner: req.user._id,
  });

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await newListing.save();
  req.flash("success", "New rental item is created with shop location 📍");
  res.redirect("/");
};



module.exports.getAllListings = async (req, res) => {
  const allListing = await Listing.find();
  res.render("index", { listings: allListing });
};

module.exports.renderNewForm = (req, res) => {
  console.log(res.locals.currUser);
  
  if (res.locals.currUser.role !== "admin"&& res.locals.currUser.role !== "seller") {
    req.flash("error","you are not registered as seller");
    res.redirect("/", { apiKey: res.locals.googleApiKey });
  }
  else
  res.render("new",{ apiKey: res.locals.googleApiKey });
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
    return res.redirect("/", { apiKey: res.locals.googleApiKey });
  }

  // ✅ calculate avg rating
  let avgRating = 0;
  if (clickListing.reviews.length > 0) {
    const total = clickListing.reviews.reduce((sum, r) => sum + r.rating, 0);
    avgRating = total / clickListing.reviews.length;
  }

  res.render("Show", { clickListing, avgRating,apiKey: res.locals.googleApiKey});
};


module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const newListing = await Listing.findById(id);
  res.render("edit", { newListing ,apiKey: res.locals.googleApiKey});
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
  res.redirect("/");
};