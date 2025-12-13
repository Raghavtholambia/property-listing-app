const badgeController = require("./badgeController");

// After rental completion
await badgeController.updateUserBadges(rental.renter);
await badgeController.updateSellerBadges(rental.store);
