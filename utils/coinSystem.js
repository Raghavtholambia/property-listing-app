const User = require("../models/users");
const Store = require("../models/store");

// ================================
// 🏆 BADGE LEVELS
// ================================
const BADGE_LEVELS = [
  { name: "Bronze", threshold: 0 },
  { name: "Silver", threshold: 20000 },
  { name: "Gold", threshold: 50000 },
  { name: "Platinum", threshold: 100000 }
];

// =========================================================
// 🟢 BUYER COINS
// =========================================================
async function awardBuyerCoins(userId, amount, storeId, listingId = null) {
  const store = await Store.findById(storeId);
  if (!store) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const ppCoins = Math.floor(amount * 0.05);
  const spCoins = Math.floor(amount * 0.20);

  user.ppCoins += ppCoins;

  let entry = user.spCoins.find(
    c => c.storeId.toString() === storeId.toString()
  );

  if (!entry) {
    user.spCoins.push({
      storeId,
      storeName: store.shopName,
      coins: spCoins,
      listingId
    });
  } else {
    entry.coins += spCoins;
  }

  await user.save();
  return { ppCoins, spCoins };
}

// =========================================================
// 🟣 SELLER + STORE COINS
// =========================================================
async function awardSellerCoins(sellerId, amount, storeId, listingId = null) {
  const store = await Store.findById(storeId);
  if (!store) return null;

  const seller = await User.findById(sellerId);
  if (!seller) return null;

  const ppCoins = Math.floor(amount * 0.05);
  const spCoins = Math.floor(amount * 0.20);

  seller.ppCoins += ppCoins;

  let entry = seller.spCoins.find(
    c => c.storeId.toString() === storeId.toString()
  );

  if (!entry) {
    seller.spCoins.push({
      storeId,
      storeName: store.shopName,
      coins: spCoins,
      listingId
    });
  } else {
    entry.coins += spCoins;
  }

  // ⭐ STORE BADGE COINS
  store.shopCoins += spCoins;

  await seller.save();
  await store.save();

  return { ppCoins, spCoins };
}

// =========================================================
// 🏆 UPDATE STORE BADGE (FINAL + CORRECT)
// =========================================================
async function updateStoreBadge(storeId) {
  const store = await Store.findById(storeId);
  if (!store) return null;

  let badge = "bronze";

  for (const level of BADGE_LEVELS) {
    if (store.shopCoins >= level.threshold) {
      badge = level.name;
    }
  }

  if (store.badge !== badge) {
    store.badge = badge;
    await store.save();
  }

  return badge;
}

module.exports = {
  awardBuyerCoins,
  awardSellerCoins,
  updateStoreBadge
};
