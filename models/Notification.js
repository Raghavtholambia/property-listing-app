const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  // who receives the notification
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // who triggered the notification (also a User)
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // which item the notification is related to
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },

  message: { type: String, required: true },

  link: { type: String }, // e.g. redirect to listing or orders page

  isRead: { type: Boolean, default: false },

  date: { type: Date, default: Date.now },

  // support array of images (listing.image is array)
  image: [
    {
      url: String,
      filename: String,
      store: String,
    }
  ],
});

module.exports = mongoose.model("Notification", notificationSchema);
