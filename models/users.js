const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'seller'],
    default: 'user',
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  isVerified: { type: Boolean, default: false },
  verificationOtp: String,
  otpExpires: Date,

  // 👇 added for profile section
  fullName: String,
  bio: String,
  phone: String,
  address: String,
  profileImage: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // default avatar
  },
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'username' });

const User = mongoose.model("User", userSchema);
module.exports = User;





// (async () => {

//   try {
    

//     // delete all users and sellers (keep admin)
//     const user= await User.find({ });
//     console.log(user);
//     //  await User.deleteMany({username: "raghav"});


//     console.log("✅ All users and sellers deleted!");
    
//   } catch (err) {
//      console.error(err);
//   }
// })();

