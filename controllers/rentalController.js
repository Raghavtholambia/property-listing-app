const Rental = require("../models/rental");
const Listing = require("../models/listing");
const ShopCoin = require("../models/ShopCoin");
const Transaction = require("../models/transaction");
const Store = require("../models/store");
const User = require("../models/users");
const badgeController = require("./badgeController");

// Create a new rental (user rents an item)
module.exports.createRental = async (req, res) => {
    try {
        const { listingId, days } = req.body;
    const renterId = req.user._id;

    // 1️⃣ Fetch listing
    const listing = await Listing.findById(listingId).populate("store");

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("back");
    }

    const store = listing.store;

    // 2️⃣ Calculate total price
    const totalPrice = listing.pricePerDay * days;

    // 3️⃣ Create rental
    const rental = await Rental.create({
      item: listing._id,
      store: store._id,
      renter: renterId,
      days,
      pricePerDay: listing.pricePerDay,
      totalPrice,
    });

    // 4️⃣ ⭐ EARN STORE COINS (SC)
    const scCoins = totalPrice; // 1₹ = 1 SC

    let shopCoin = await ShopCoin.findOne({ user: renterId, store: store._id });
    if (!shopCoin) {
      shopCoin = new ShopCoin({ user: renterId, store: store._id, coins: 0 });
    }
    shopCoin.coins += scCoins;
    await shopCoin.save();

    // Transaction log
    await Transaction.create({
      user: renterId,
      store: store._id,
      type: "EARN_SC",
      amount: scCoins,
      description: `Earned ${scCoins} SC by renting ${listing.itemName}`,
    });

    rental.coinsEarned.sc = scCoins;

    // 5️⃣ ⭐ EARN PERSONAL COINS (PC) — optional formula
    // For example: 5% of total price
    const pcCoins = Math.floor(totalPrice * 0.05);
    const user = await User.findById(renterId);
    user.personalCoins += pcCoins;
    await user.save();

    // Transaction log
    await Transaction.create({
      user: renterId,
      type: "EARN_PC",
      amount: pcCoins,
      description: `Earned ${pcCoins} PC by renting ${listing.itemName}`,
    });

    rental.coinsEarned.pc = pcCoins;

    // 6️⃣ ⭐ GIVE PP TO SELLER
    const ppEarned = Math.floor(totalPrice * 0.1); // Example: 10% of rent = PP
    const seller = await Store.findById(store._id);
    seller.promotionPoints += ppEarned;
    await seller.save();

    // Transaction log for PP
    await Transaction.create({
      store: store._id,
      type: "EARN_PP",
      amount: ppEarned,
      description: `Earned ${ppEarned} PP from rental by ${req.user.username}`,
    });

    await rental.save();

    req.flash(
      "success",
      `Rental successful! You earned ${scCoins} SC, ${pcCoins} PC. Seller earned ${ppEarned} PP.`
    );
    res.redirect("/rentals/history");
  } catch (err) {
    console.error("Error creating rental:", err);
    req.flash("error", "Something went wrong during rental.");
    res.redirect("back");
  }
};

// View rental history for a user
module.exports.getRentalHistory = async (req, res) => {
  try {
    const rentals = await Rental.find({ renter: req.user._id })
      .populate("item")
      .populate("store")
      .sort({ createdAt: -1 });

    res.render("rentals/history", { rentals });
  } catch (err) {
    console.error(err);
    req.flash("error", "Cannot fetch rental history");
    res.redirect("back");
  }
};


// Example: marking rental as completed
module.exports.completeRental = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const rental = await Rental.findById(rentalId);

    if (!rental) {
      req.flash("error", "Rental not found");
      return res.redirect("back");
    }

    rental.status = "completed";
    await rental.save();

    // Update user & seller badges automatically
    await badgeController.updateUserBadges(rental.renter);
    await badgeController.updateSellerBadges(rental.store);

    req.flash("success", "Rental completed and badges updated!");
    res.redirect("/rentals/history");

  } catch (err) {
    console.error(err);
    req.flash("error", "Error completing rental");
    res.redirect("back");
  }
};
