const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Listing = require("../models/listing");
const redisClient = require("../config/redis");

exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { listingId, startDate, endDate, quantity = 1 } = req.body;
    const renterId = req.user._id.toString();

    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start >= end) {
      return res.status(400).json({ message: "Invalid rental period" });
    }

    // 🔐 1. VERIFY REDIS LOCK OWNERSHIP
    const lockKey = `lock:${listingId}:${startDate}:${endDate}`;
    const lockOwner = await redisClient.get(lockKey);

    if (!lockOwner || lockOwner !== renterId) {
      return res.status(403).json({
        message: "Booking lock expired or invalid"
      });
    }

    // 🔒 2. FETCH LISTING INSIDE TRANSACTION
    const listing = await Listing.findOne({
      _id: listingId,
      isActive: true
    }).session(session);

    if (!listing) {
      return res.status(404).json({ message: "Listing not available" });
    }

    // ⚠️ 3. OVERLAP CHECK (CONFIRMED BOOKINGS ONLY)
    const conflict = await Booking.findOne({
      listingId,
      status: "confirmed",
      startDate: { $lt: end },
      endDate: { $gt: start }
    }).session(session);

    if (conflict) {
      return res.status(409).json({
        message: "Listing already booked for selected dates"
      });
    }

    // 💰 4. PRICE CALCULATION
    const days =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;

    const totalPrice = days * listing.pricePerDay * quantity;

    // 📝 5. CREATE BOOKING
    const booking = await Booking.create(
      [{
        listingId,
        renterId,
        ownerId: listing.ownerId,
        startDate: start,
        endDate: end,
        quantity,
        totalPrice,
        status: "confirmed"
      }],
      { session }
    );

    await session.commitTransaction();

    // 🧹 6. CLEANUP
    await redisClient.del(`bookings:${listingId}`); // cache invalidate
    await redisClient.del(lockKey);                 // release lock

    res.status(201).json({
      message: "Booking confirmed",
      booking: booking[0]
    });

  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    session.endSession();
  }
};

exports.getBookedDates = async (req, res) => {
  try {
    const { listingId } = req.params;
    const cacheKey = `bookings:${listingId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("⚡ Redis cache hit");
      return res.json(JSON.parse(cached));
    }

    console.log("🐢 Redis cache miss → MongoDB");

    const bookings = await Booking.find({
      listingId,
      status: "confirmed"
    })
      .select("startDate endDate -_id")
      .sort({ startDate: 1 });

    await redisClient.setEx(
      cacheKey,
      300,
      JSON.stringify(bookings)
    );

    res.json(bookings);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
