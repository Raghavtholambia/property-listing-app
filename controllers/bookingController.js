const Booking = require("../models/Booking");
const Listing = require("../models/listing");

exports.createBooking = async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;
    const renterId = req.user._id; // from auth middleware

    // 1️⃣ Basic validation
    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // 2️⃣ Fetch listing
    const listing = await Listing.findById(listingId);
    if (!listing || !listing.isActive) {
      return res.status(404).json({ message: "Listing not available" });
    }

    // 3️⃣ Overlap check (CRITICAL)
    const conflict = await Booking.findOne({
      listingId,
      status: "confirmed",
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });

    if (conflict) {
      return res.status(409).json({
        message: "Listing already booked for selected dates"
      });
    }

    // 4️⃣ Price calculation
    const days =
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);

    const totalPrice = days * listing.pricePerDay;

    // 5️⃣ Create booking
    const booking = await Booking.create({
      listingId,
      renterId,
      ownerId: listing.ownerId,
      startDate,
      endDate,
      totalPrice
    });

    res.status(201).json({
      message: "Booking confirmed",
      booking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBookedDates = async (req, res) => {
  try {
    const { listingId } = req.params;

    const bookings = await Booking.find({
      listingId,
      status: "confirmed"
    }).select("startDate endDate -_id");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
