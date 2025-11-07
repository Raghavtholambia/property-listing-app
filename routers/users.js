require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/users");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

module.exports = (io) => {
  // 📌 Register user
  router.post("/registeredUser", async (req, res, next) => {
    try {
      const { username, email, password, role } = req.body;
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        io.emit("notification", { type: "error", message: "Username already taken. Choose another one." });
        return res.redirect("/?showLogin=true&tab=register");
      }

      let userRole = ["user", "seller"].includes(role) ? role : "user";
      if (email === "admin@gmail.com") userRole = "admin";

      const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
      const otpExpiry = Date.now() + 10 * 60 * 1000;

      const newUser = new User({ username, email, role: userRole, isVerified: false, verificationOtp: otp, otpExpires: otpExpiry });
      const registeredUser = await User.register(newUser, password);

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
      res.redirect(`/?showVerifyOtp=true&username=${username}&email=${email}`);
    } catch (e) {
      io.emit("notification", { type: "error", message: e.message });
      res.redirect("/?showLogin=true&tab=register");
    }
  });

  // 📌 Verify OTP
  router.post("/verify-otp", async (req, res, next) => {
    try {
      const { email, username, otp } = req.body;
      const user = await User.findOne({ username, email });

      if (!user) {
        io.emit("notification", { type: "error", message: "User not found or email mismatch." });
        return res.redirect("/?showLogin=true&tab=register");
      }

      if (!user.verificationOtp || user.verificationOtp !== otp || user.otpExpires < Date.now()) {
        io.emit("notification", { type: "error", message: "Invalid or expired OTP." });
        return res.redirect(`/?showVerifyOtp=true&username=${username}&email=${email}`);
      }

      user.isVerified = true;
      user.verificationOtp = undefined;
      user.otpExpires = undefined;
      await user.save();

      req.login(user, (err) => {
        if (err) return next(err);
        io.emit("notification", { type: "success", message: "Email verified! You are now logged in." });
        res.redirect(res.locals.redirectUrl || "/");
      });
    } catch (err) {
      io.emit("notification", { type: "error", message: "Something went wrong during OTP verification." });
      res.redirect("/?showLogin=true&tab=register");
    }
  });

  // 📌 Login
  router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/?showLogin=true&tab=login",
      failureFlash: true,
    }),
    async (req, res) => {
      if (!req.user.isVerified) {
        req.logout(() => {
          io.emit("notification", { type: "error", message: "Please verify your email before logging in." });
          res.redirect("/?showLogin=true&tab=register");
        });
      } else {
        io.emit("notification", { type: "success", message: `Welcome back, ${req.user.username}!` });
        res.redirect(res.locals.redirectUrl || "/");
      }
    }
  );

  // 📌 Logout
  router.get("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      io.emit("notification", { type: "success", message: "Logout successful!" });
      res.redirect("/");
    });
  });

  return router;
};
