
const express = require("express");
const Notification = require("../models/Notification");

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const Razorpay = require("razorpay");

const Listing = require("../models/listing");
const Store = require("../models/store");
const Transaction = require("../models/Transactions");

const {
  awardBuyerCoins,
  awardSellerCoins,
  updateStoreBadge
} = require("../utils/coinSystem");


const badgeController = require("../controllers/badgeController");
const { storage } = require("../cloudConfig");


// ======================================================
// 🔐 Ensure user is logged in
// ======================================================
function isLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Login required for checkout",
    });
  }
  next();
}


// ======================================================
// ⭐ AUTO-DETECT LISTING → SELLER & STORE
// ======================================================
async function getListingDetails(listingId) {
  const listing = await Listing.findById(listingId);

  if (!listing) return null;

  let storeId = listing.store;

  if (!storeId) {
    const store = await Store.findOne({ owner: listing.owner });
    storeId = store ? store._id : null;
  }

  return {
    sellerId: listing.owner,
    storeId,
    listing,
  };
}



// ======================================================
// 🟢 MAIN PAYMENT PROCESSOR
// ======================================================
async function processPayment(req, res, method) {
  try {
    const { listingId, amount } = req.body;

    if (!listingId) return res.status(400).json({ success: false, message: "listingId missing" });
    if (!amount) return res.status(400).json({ success: false, message: "Amount missing" });

    // ---------- GET LISTING DETAILS ----------
    const details = await getListingDetails(listingId);
    if (!details) return res.status(404).json({ success: false, message: "Listing not found" });

    const { sellerId, storeId, listing } = details;

    if (!sellerId) return res.status(404).json({ success: false, message: "Seller not found" });
    if (!storeId) return res.status(404).json({ success: false, message: "Store not found for this listing" });


// ======================================================
// 🪙 COINS – BUYER + SELLER
// ======================================================
const buyerCoins = await awardBuyerCoins(
  req.user._id,
  amount,
  storeId,
  listingId
);

const sellerCoins = await awardSellerCoins(
  sellerId,
  amount,
  storeId,
  listingId
);

// ======================================================
// 🏅 STORE BADGE (ONE PLACE ONLY)
// ======================================================
const newBadge = await updateStoreBadge(storeId);



// ======================================================
// 💳 SAVE TRANSACTION
// ======================================================
await Transaction.create({
  user: req.user._id,
  store: storeId,
  listing: listingId,
  amount,
  type: `payment-${method}`,
});


// ======================================================
// 🏅 UPDATE USER BADGES ONLY (NO SELLER BADGE HERE)
// ======================================================
await badgeController.updateUserBadges(req.user._id);


// ======================================================
// 🔔 SEND NOTIFICATION TO BUYER
// ======================================================
const buyerImage = listing.image?.[0]?.url || listing.image || "/images/default.png";

await Notification.create({
  user: req.user._id,
  item: listing._id,
  message: `Payment successful for ${listing.itemName}. You spent ₹${amount}.`,
  link: `/listing/${listingId}`,
  image: buyerImage,
  seller: sellerId,
});


// 🔔 SEND NOTIFICATION TO SELLER
await Notification.create({
  user: sellerId,
  item: listing._id,
  message: `You received a rental order for ${listing.itemName}. Earnings: ₹${amount}`,
  link: `/store/orders`,
  seller: req.user._id,
});


// ======================================================
// ✅ SUCCESS RESPONSE
// ======================================================
res.json({
  success: true,
  message: `${method.toUpperCase()} Payment Successful`,
  listingId,
  buyerCoins,
  sellerCoins,
  newBadge,
});

  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: `${method.toUpperCase()} Payment Failed`,
    });
  }
}



// ======================================================
// 🟢 PAYMENT ROUTES
// ======================================================
router.post("/pay/upi", isLoggedIn, (req, res) => {
  return processPayment(req, res, "upi");
});

router.post("/pay/card", isLoggedIn, (req, res) => {
  return processPayment(req, res, "card");
});

router.post("/pay/cod", isLoggedIn, (req, res) => {
  return processPayment(req, res, "cod");
});



// ======================================================
// 🟡 RAZORPAY ORDER CREATION
// ======================================================
const razorpay = new Razorpay({
  key_id: "YOUR_KEY_ID",
  key_secret: "YOUR_KEY_SECRET",
});

router.post("/create-order", isLoggedIn, async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "order_" + Date.now(),
    });

    res.json({ success: true, order });

  } catch (err) {
    console.error("RAZORPAY ERROR:", err);
    res.status(500).json({ success: false, message: "Razorpay order error" });
  }
});



module.exports = router;
