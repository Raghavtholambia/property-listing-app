const Listing = require("../models/listing");
const { cloudinary } = require("../cloudConfig");
const Store = require("../models/store");

// =========================================
// ⭐ CREATE LISTING
// =========================================
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

  // Find seller store
  const store = await Store.findOne({ owner: req.user._id });

  if (!store) {
    req.flash("error", "You must create a shop before adding listings.");
    return res.redirect("/store/new");
  }

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
    store: store._id,
    verifiedByAdmin: false        // ⭐ Must be approved by admin
  });

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await newListing.save();
  req.flash("success", "Listing created. Waiting for admin approval.");
  res.redirect("/");
};

// =========================================
// ⭐ GET ALL (ONLY APPROVED LISTINGS SHOWN)
// =========================================
module.exports.getAllListings = async (req, res) => {


  const allListing = await Listing.find()
    .populate("owner")
    .populate("store");

  res.render("index", { listings: allListing });
};

// =========================================
// ⭐ RENDER NEW LISTING FORM
// =========================================
module.exports.renderNewForm = (req, res) => {
  if (res.locals.currUser.role !== "seller" && res.locals.currUser.role !== "admin") {
    req.flash("error", "You are not registered as seller");
    return res.redirect("/");
  }

  res.render("new", { apiKey: res.locals.googleApiKey });
};

// =========================================
// ⭐ GET A SINGLE LISTING (ONLY IF APPROVED)
// =========================================
module.exports.getSingleListing = async (req, res) => {
  try {
    const { id } = req.params;

    const clickListing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" }
      })
      .populate("owner")
      .populate("store");

    if (!clickListing) {
      req.flash("error", "Listing not found");
      return res.redirect("/");
    }

    
    // Calculate average rating
    let avgRating = 0;
    if (clickListing.reviews.length > 0) {
      const total = clickListing.reviews.reduce((s, r) => s + r.rating, 0);
      avgRating = total / clickListing.reviews.length;
    }
    
    if (!clickListing.verifiedByAdmin) {
      // req.flash("error", "This listing is pending admin approval.");
      if (req.user.role==='admin') {
           return res.render("Show", {
      clickListing,
      avgRating,
      apiKey: res.locals.googleApiKey
    });
  }
  else return res.redirect("/");
}

return res.render("Show", {
clickListing,
avgRating,
apiKey: res.locals.googleApiKey
});


  } catch (err) {
    console.error("Error loading listing:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/");
  }
};

// =========================================
// ⭐ RENDER EDIT FORM
// =========================================
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const newListing = await Listing.findById(id);

  res.render("edit", {
    newListing,
    apiKey: res.locals.googleApiKey
  });
};

// =========================================
// ⭐ UPDATE LISTING
// =========================================
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const updatedListing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing
  });

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

  req.flash("success", "Listing updated");
  res.redirect(`/listing/${id}`);
};

// =========================================
// ⭐ DELETE LISTING
// =========================================
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

// =========================================
// ⭐ ADMIN: VERIFY ONE LISTING
// =========================================
module.exports.verifyOneListing = async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndUpdate(id, { verifiedByAdmin: true });

  req.flash("success", "Listing approved!");
  res.redirect("/admin/listings");
};

// =========================================
// ⭐ ADMIN: VERIFY ALL LISTINGS
// =========================================
module.exports.verifyAllListings = async (req, res) => {
  await Listing.updateMany({}, { verifiedByAdmin: true });

  req.flash("success", "All listings approved!");
  res.redirect("/resource");
};
// Admin → Get unverified listings
module.exports.getAllUnverifiedListings = async (req, res) => {
  const pendingListings = await Listing.find({ verifiedByAdmin: false })
    .populate("owner")
    .populate("store");

  res.render("admin/pendingListings", { pendingListings });
};
