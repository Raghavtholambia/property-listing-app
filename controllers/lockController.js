const redisClient = require("../config/redis");
const Listing = require("../models/listing");

exports.lockDates = async (req, res) => {
  try {
console.log("🔥 lockController file loaded");
    const { listingId, startDate, endDate, quantity } = req.body;


    const userId = req.user._id.toString();

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.json({ success: false, reason: "Listing not found" });
    }

    const lockKey = `lock:${listingId}:${startDate}:${endDate}`;

    // 🚫 already locked
    const existing = await redisClient.get(lockKey);
    if (existing) {
      return res.json({
        success: false,
        reason: "Dates temporarily locked by another user"
      });
    }

    // ✅ set lock with TTL (5 min)
    await redisClient.set(
      lockKey,
      userId,
      { NX: true, EX: 300 }
    );

    req.io?.to(listingId).emit("datesLocked", {
      startDate,
      endDate
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.unlockDates = async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;
    const userId = req.user._id.toString();

    const lockKey = `lock:${listingId}:${startDate}:${endDate}`;
    const owner = await redisClient.get(lockKey);

    if (owner === userId) {
      await redisClient.del(lockKey);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
