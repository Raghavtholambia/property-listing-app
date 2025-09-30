const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,  // ✅ username must be unique
    trim: true
  },
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

// passport-local-mongoose will handle password hashing & username field
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

