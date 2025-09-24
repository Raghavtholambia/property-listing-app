require("dotenv").config();

const express = require('express');
const router = express.Router();
const User = require('../models/users');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

// Register form
// Registration POST
router.post("/registeredUser", async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    let userRole = ["user", "seller"].includes(role) ? role : "user";
    if (email === "admin@gmail.com") userRole = "admin";

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    const newUser = new User({
      username,
      email,
      role: userRole,
      isVerified: false,
      verificationOtp: otp,
      otpExpires: otpExpiry,
    });

    const registeredUser = await User.register(newUser, password);

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: registeredUser.email,
      from: process.env.EMAIL_USER,
      subject: "Your Rent App OTP Code",
      html: `<p>Hello ${registeredUser.username},</p>
             <p>Your OTP is: <b>${otp}</b></p>
             <p>Valid for 10 minutes.</p>`,
    });

    req.flash("success", "OTP sent to your email. Please verify.");
    // redirect with query params so popup auto-opens
    res.redirect(`/?showVerifyOtp=true&email=${email}`);

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/?showLogin=true&tab=register"); // open register tab again
  }
});

// Verify OTP POST
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "User not found.");
    return res.redirect("/?showLogin=true&tab=register");
  }

  if (user.verificationOtp !== otp || user.otpExpires < Date.now()) {
    req.flash("error", "Invalid or expired OTP.");
    return res.redirect(`/?showVerifyOtp=true&email=${email}`);
  }

  user.isVerified = true;
  user.verificationOtp = undefined;
  user.otpExpires = undefined;
  await user.save();

  req.flash("success", "Email verified! You can log in now.");
  res.redirect("/?showLogin=true&tab=login");
});



// Login form
router.get("/login", (req, res) => {
    res.render("login");
});

// Local login
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/user/login",
    failureFlash: true,
  }),
  async (req, res, next) => {
    if (!req.user.isVerified) {
      req.logout(() => {
        req.flash("error", "Please verify your email before logging in.");
        res.redirect("/user/login");
      });
    } else {
      req.flash("success", "Welcome back!",req.user.username);
      res.redirect(res.locals.redirectUrl || "/");
    }
  }
);

// Logout
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logout successfully");
        res.redirect("/");
    });
});

// ✅ Google Auth Route
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Google Auth Callback
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/user/login", failureFlash: true }),
  (req, res) => {
    req.flash("success", "Logged in with Google!");
    res.redirect("/");
  }
);

// ✅ Google session check (useful for debugging)
router.get("/auth/verify", (req, res) => {
  if (req.isAuthenticated()) {
    return res.send(`You are logged in as: ${req.user.username || req.user.email}`);
  }
  res.send("Not logged in");
});

module.exports = router;
