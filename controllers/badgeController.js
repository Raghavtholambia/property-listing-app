const User = require("../models/users");
const Store = require("../models/store");
const Rental = require("../models/rental");

// Update User Badges
module.exports.updateUserBadges = async (userId) => {
  const user = await User.findById(userId);
  const rentalCount = await Rental.countDocuments({ renter: userId });

  if (rentalCount >= 50) user.badges = ["Diamond"];
  else if (rentalCount >= 5) user.badges = ["Gold"];
  else if (rentalCount >= 5) user.badges = ["Silver"];
  else user.badges = ["Bronze"];

  // Bonus PC based on badge
  let pcBonus = 0;
  switch (user.badges[0]) {
    case "Silver":
      pcBonus = 10;
      break;
    case "Gold":
      pcBonus = 50;
      break;
    case "Diamond":
      pcBonus = 100;
      break;
  }

  user.personalCoins += pcBonus;
  await user.save();
};

// Update Seller Badges
module.exports.updateSellerBadges = async (storeId) => {
  const store = await Store.findById(storeId);
  const rentals = await Rental.find({ store: storeId, status: "completed" });
  const totalRevenue = rentals.reduce((sum, r) => sum + r.totalPrice, 0);

  if (totalRevenue >= 50000) store.badge = "Diamond";
  else if (totalRevenue >= 20000) store.badge = "Gold";
  else if (totalRevenue >= 5000) store.badge = "Silver";
  else store.badge = "Bronze";

  // Bonus PP per badge
  let ppBonus = 0;
  switch (store.badge) {
    case "Silver":
      ppBonus = 10;
      break;
    case "Gold":
      ppBonus = 50;
      break;
    case "Diamond":
      ppBonus = 100;
      break;
  }

  store.promotionPoints += ppBonus;
  await store.save();
};
