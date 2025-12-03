require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/users");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

module.exports = (io) => {

  // ============================================================
  // 📌 REGISTER USER (with OTP email verification)
  // ============================================================
  router.post("/registeredUser", async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // ❗ Username unique check
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        io.emit("notification", { type: "error", message: "Username already taken. Choose another one." });
        return res.redirect("/?showLogin=true&tab=register");
      }

      // Assign role safely
      let userRole = "user";
      if (email === "admin@gmail.com") userRole = "admin";

      // Generate OTP
      const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
      const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min

      // Create new user but not verified yet
      const newUser = new User({
        username,
        email,
        role: userRole,
        isVerified: false,
        verificationOtp: otp,
        otpExpires: otpExpiry,
      });

      // Register with password hashing
      await User.register(newUser, password);

      // Send OTP email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      await transporter.sendMail({
        to: email,
        from: process.env.EMAIL_USER,
        subject: "Your Rent App OTP Code",
        html: `<p>Hello ${username},</p><p>Your OTP is: <b>${otp}</b></p><p>Valid for 10 minutes.</p>`,
      });

      io.emit("notification", { type: "success", message: "OTP sent to your email. Please verify." });

      return res.redirect(`/?showVerifyOtp=true&username=${username}&email=${email}`);

    } catch (e) {
      io.emit("notification", { type: "error", message: e.message });
      return res.redirect("/?showLogin=true&tab=register");
    }
  });

  // ============================================================
  // 📌 VERIFY OTP & LOGIN
  // ============================================================
  router.post("/verify-otp", async (req, res, next) => {
    try {
      const { email, username, otp } = req.body;

      const user = await User.findOne({ username, email });
      if (!user) {
        io.emit("notification", { type: "error", message: "User not found or email mismatch." });
        return res.redirect("/?showLogin=true&tab=register");
      }

      // OTP check
      if (!user.verificationOtp || user.verificationOtp !== otp || user.otpExpires < Date.now()) {
        io.emit("notification", { type: "error", message: "Invalid or expired OTP." });
        return res.redirect(`/?showVerifyOtp=true&username=${username}&email=${email}`);
      }

      // Mark verified
      user.isVerified = true;
      user.verificationOtp = undefined;
      user.otpExpires = undefined;
      await user.save();

      // Login user
      req.login(user, (err) => {
        if (err) return next(err);

        io.emit("notification", { type: "success", message: "Email verified! You are now logged in." });
        return res.redirect(res.locals.redirectUrl || "/");
      });

    } catch (err) {
      io.emit("notification", { type: "error", message: "Something went wrong during OTP verification." });
      return res.redirect("/?showLogin=true&tab=register");
    }
  });

  // ============================================================
  // 📌 LOGIN USER
  // ============================================================
  router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/?showLogin=true&tab=login",
      failureFlash: true,
    }),
    async (req, res) => {
      // Verified check
      if (!req.user.isVerified) {
        req.logout(() => {
          io.emit("notification", { type: "error", message: "Please verify your email before logging in." });
          return res.redirect("/?showLogin=true&tab=register");
        });
      } else {
        io.emit("notification", { type: "success", message: `Welcome back, ${req.user.username}!` });
        return res.redirect(res.locals.redirectUrl || "/");
      }
    }
  );

  // ============================================================
  // 📌 LOGOUT
  // ============================================================
  router.get("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);

      io.emit("notification", { type: "success", message: "Logout successful!" });
      return res.redirect("/");
    });
  });

  // ============================================================
  // 🌐 GOOGLE LOGIN
  // ============================================================
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/?showLogin=true&tab=login",
    }),
    async (req, res) => {
      io.emit("notification", { type: "success", message: `Welcome, ${req.user.username}! Logged in via Google.` });

      return res.redirect("/");
    }
  );

  return router;
};
