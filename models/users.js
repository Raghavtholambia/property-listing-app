const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'seller'],
    default: 'user'
  },
  googleId: {
    type: String, // store google profile ID
    unique: true,
    sparse: true
  },
  isVerified: { type: Boolean, default: false },
 verificationOtp: String,
  otpExpires: Date,  
});
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
// (async () => {

//   try {
    

//     // delete all users and sellers (keep admin)
//     await User.deleteMany();
//    // await User.deleteOne({ username: "rego12" });

//     console.log("✅ All users and sellers deleted!");
    
//   } catch (err) {
//      console.error(err);
//   }
// })();

