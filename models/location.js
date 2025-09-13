const mongoose = require("mongoose");
const { Schema } = mongoose;

const locationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "userSchema", // link to User schema
    required: true
  },
  address: {
    type: String
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Location", locationSchema);
