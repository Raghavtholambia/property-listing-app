const express = require('express');
const router = express.Router();
const User = require('../models/users');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware')

router.get("/", (req, res) => {
    res.render("register");
});

router.post("/registeredUser", async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
 
    // Default role check
    let userRole = ['user', 'seller'].includes(role) ? role : 'user';

    // Auto-assign admin role for specific email
    if (email === 'admin@gmail.com') {
      userRole = 'admin';
    }

    const newUser = new User({ username, email, role: userRole });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "New user registered and logged in!");
      res.redirect("/listing");
    });

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/");
  }
});



router.get("/login", (req, res) => {
    res.render("login");
});


// ✅ Fixed: remove extra parentheses
router.post('/login',
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    (req, res) => {
        req.flash("success", "Welcome back!");
        res.redirect(res.locals.redirectUrl || "/listing");
    }
);

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "Logout successfully");
        res.redirect("/listing");
    });
});

module.exports = router;
