const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

// Schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'seller'],
        default: 'user'
    }
});

userSchema.plugin(passportLocalMongoose);

// Model
const User = mongoose.model("userSchema", userSchema);

module.exports = User;
 