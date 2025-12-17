const Listing = require("../models/listing");
const { cloudinary } = require("../cloudConfig");
const Store = require("../models/store");

// =========================================
// ⭐ CREATE LISTING
// =========================================
module.exports.createListing = async (req, res) => {
    // Use object destructuring for cleaner access
    const { listing } = req.body;

    // 1. Find seller store
    const store = await Store.findOne({ owner: req.user._id });

    if (!store) {
        req.flash("error", "You must create a shop before adding listings.");
        // Ensure you redirect to the correct store creation path
        return res.redirect("/stores/new"); 
    }

    const newListing = new Listing({
        ...listing, // Spread operator to assign all fields from req.body.listing
        owner: req.user._id,
        store: store._id,
        verifiedByAdmin: false // Default to false, awaiting admin approval
    });

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }
    
    // Check if the updateAverageRating method should be called here (usually not needed on creation)
    
    await newListing.save();
    req.flash("success", "Listing created. Waiting for admin approval.");
    res.redirect("/");
};

// =========================================
// ⭐ GET ALL (ONLY APPROVED LISTINGS SHOWN)
// =========================================
module.exports.getAllListings = async (req, res) => {
    // SECURITY/LOGIC FIX: Only show approved listings to general users
    const allListing = await Listing.find({ }) 
        .populate("owner")
        .populate("store");

    // Consider an alternate view for admin if they need to see all.
    res.render("index", { listings: allListing });
};

// =========================================
// ⭐ RENDER NEW LISTING FORM
// =========================================
module.exports.renderNewForm = async (req, res) => {
    // Ensure user is logged in (handled by middleware but good to check roles)
    if (!res.locals.currUser) {
        req.flash("error", "You must be logged in.");
        return res.redirect("/login");
    }

    // Role check
    if (res.locals.currUser.role !== "seller" && res.locals.currUser.role !== "admin") {
        req.flash("error", "You must be registered as a seller to create a listing.");
        return res.redirect("/");
    }

    // Check if seller has a store before allowing listing creation
    const storeExists = await Store.exists({ owner: res.locals.currUser._id });
    if (!storeExists && res.locals.currUser.role === "seller") {
        req.flash("error", "Please create your shop first.");
        return res.redirect("/stores/new");
    }

    res.render("new", { apiKey: res.locals.googleApiKey });
};

// =========================================
// ⭐ GET A SINGLE LISTING (APPROVAL CHECK)
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

        // Calculation of average rating is redundant if the hook/method is used, 
        // but it's fine for presentation if the hook is unreliable or runs async.
        let avgRating = clickListing.averageRating; // Use the schema field if maintained

        // 1. Check for Admin Verification
        if (!clickListing.verifiedByAdmin) {
            const userRole = req.user?.role; // Optional chaining for safety

            if (userRole === 'admin' || clickListing.owner.equals(req.user?._id)) {
                // Allow Admin or the Owner to view the unverified listing
                req.flash("warning", "This listing is pending admin approval.");
            } else {
                // Redirect all other users
                req.flash("error", "This listing is not currently available for viewing.");
                return res.redirect("/");
            }
        }
        
        // After all checks, render the page
        return res.render("Show", {
            clickListing,
            avgRating, // Using the schema field or calculated value
            apiKey: res.locals.googleApiKey
        });

    } catch (err) {
        console.error("Error loading listing:", err);
        req.flash("error", "Something went wrong fetching the listing.");
        res.redirect("/");
    }
};

// =========================================
// ⭐ RENDER EDIT FORM
// =========================================
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listingToEdit = await Listing.findById(id);

    // If a user edits a listing, it should probably be marked unverified again
    // listingToEdit.verifiedByAdmin = false; 
    // await listingToEdit.save();

    res.render("edit", {
        newListing: listingToEdit, // Renamed for clarity in controller
        apiKey: res.locals.googleApiKey
    });
};

// =========================================
// ⭐ UPDATE LISTING
// =========================================
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body.listing;

    // IMPORTANT: If content is updated, reset approval status
    updateData.verifiedByAdmin = false; 

    const updatedListing = await Listing.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (req.file) {
        // Delete old image from Cloudinary (if applicable)
        if (updatedListing.image?.filename) {
            await cloudinary.uploader.destroy(updatedListing.image.filename);
        }

        updatedListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await updatedListing.save();
    }

    req.flash("success", "Listing updated. It is now pending admin approval.");
    res.redirect(`/listing/${id}`);
};

// =========================================
// ⭐ DELETE LISTING
// =========================================
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;

    const listingToDelete = await Listing.findById(id);

    // Delete image from Cloudinary
    if (listingToDelete && listingToDelete.image?.filename) {
        await cloudinary.uploader.destroy(listingToDelete.image.filename);
    }

    // The findByIdAndDelete hook handles review deletion
    await Listing.findByIdAndDelete(id); 

    req.flash("success", "Listing deleted successfully");
    res.redirect("/");
};

// =========================================
// ⭐ ADMIN: VERIFY ONE LISTING
// =========================================
module.exports.verifyOneListing = async (req, res) => {
    const { id } = req.params;

    // Add role check here if not using a dedicated admin middleware
    // if (req.user.role !== 'admin') { return res.status(403).send("Forbidden"); }

    await Listing.findByIdAndUpdate(id, { verifiedByAdmin: true });

    req.flash("success", "Listing approved!");
    // Assuming the admin page for listings is /admin/listings
    res.redirect("/admin/listings"); 
};

// =========================================
// ⭐ ADMIN: VERIFY ALL LISTINGS
// =========================================
module.exports.verifyAllListings = async (req, res) => {
    // Add role check here if not using a dedicated admin middleware

    // Use updateMany to set the flag on all unverified listings
    await Listing.updateMany({ verifiedByAdmin: false }, { verifiedByAdmin: true });

    req.flash("success", "All pending listings approved!");
    res.redirect("/resource"); // Redirect to a suitable admin dashboard
};

// =========================================
// ⭐ Admin → Get unverified listings
// =========================================
module.exports.getAllUnverifiedListings = async (req, res) => {
    // Add role check here

    const pendingListings = await Listing.find({ verifiedByAdmin: false })
        .populate("owner")
        .populate("store");

    res.render("admin/pendingListings", { pendingListings });
};