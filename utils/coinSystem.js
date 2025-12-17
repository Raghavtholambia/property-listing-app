const User = require("../models/users");
const Store = require("../models/store");

// ================================
// 🏆 STORE BADGE LEVELS
// ================================
const BADGE_LEVELS = [
  { name: "Bronze", threshold: 0 },
  { name: "Silver", threshold: 20000 },
  { name: "Gold", threshold: 50000 },
  { name: "Platinum", threshold: 100000 },
];

// =========================================================
// 🟢 USER (RENTER) COINS
// 2% ppCoins + 5% shopCoins
// =========================================================
async function awardBuyerCoins(userId, amount, storeId) {

  const store = await Store.findById(storeId);
  if (!store) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const ppCoins = Math.floor(amount * 0.02);
  const shopCoins = Math.floor(amount * 0.05);

  // ➕ Platform coins
  user.ppCoins += ppCoins;

  // ➕ Shop-specific coins
  let entry = user.shopCoins.find(
    (c) => c.storeId.toString() === storeId.toString()
  );

  if (!entry) {
    user.shopCoins.push({
      storeId,
      storeName: store.shopName,
      coins: shopCoins,
    });
  } else {
    entry.coins += shopCoins;
  }

  await user.save();

  return { ppCoins, shopCoins };
}

// =========================================================
// 🟣 SELLER + STORE COINS
// =========================================================
async function awardSellerCoins(sellerId, amount, storeId) {
  const store = await Store.findById(storeId);
  if (!store) return null;

  const seller = await User.findById(sellerId);
  if (!seller) return null;

  const ppCoins = Math.floor(amount * 0.02);
  const shopCoins = Math.floor(amount * 0.05);

  // ➕ Seller platform coins
  seller.ppCoins += ppCoins;

  // ➕ Seller shop coins (per store)
  let entry = seller.shopCoins.find(
    (c) => c.storeId.toString() === storeId.toString()
  );

  if (!entry) {
    seller.shopCoins.push({
      storeId,
      storeName: store.shopName,
      coins: shopCoins,
    });
  } else {
    entry.coins += shopCoins;
  }

  // ⭐ Store total coins (for badge)
  store.shopCoins += shopCoins;

  await seller.save();
  await store.save();

  return { ppCoins, shopCoins };
}

// =========================================================
// 🏆 UPDATE STORE BADGE
// =========================================================
async function updateStoreBadge(storeId) {
  const store = await Store.findById(storeId);
  if (!store) return null;

  let badge = "Bronze";

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
  updateStoreBadge,
};
