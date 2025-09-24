require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");

// Routers
const listingRouter = require("./routers/listing.js");
const reviewsRouter = require("./routers/reviews.js");
const userRouter = require("./routers/users.js");
const adminRouter = require("./routers/admin.js");
const cartRoutes = require("./routers/cart.js");
const checkoutRoutes = require("./routers/checkout.js");
const locationRoutes = require("./routers/location.js");
const searchRoutes = require("./routers/search.js");
const redirectBasedOnRole = require("./routers/resource.js");
const storeRoute = require("./routers/store.js");

// Auth & session
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/users.js");

// Models
const Listing = require("./models/listing.js");

// View setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// -------------------- Session + Flash --------------------
app.use(
  session({
    secret: "one-piece",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 1 * 24 * 60 * 60 * 1000,
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);
app.use(flash());

// -------------------- Passport Config --------------------
app.use(passport.initialize());
app.use(passport.session());

// Local strategy
passport.use(new LocalStrategy(User.authenticate()));

// Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/user/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) return done(null, existingUser);

        // Create new user
        const newUser = new User({
          username: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          role:
            profile.emails[0].value === "raghavtholambia@gmail.com" ? "admin" : "user",
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize / deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// -------------------- MongoDB --------------------
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");
}
main()
  .then(() => {
    console.log("MongoDB connected...");
  })
  .catch((err) => {
    console.log(err);
  });

// -------------------- Middleware --------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  res.locals.googleApiKey = process.env.GOOGLE_API_KEY;
  next();
});

// Navbar middleware → inject categories & sample items
app.use(async (req, res, next) => {
  try {
    const categories = await Listing.distinct("category");
    let categoryItems = {};

    for (let cat of categories) {
      categoryItems[cat] = await Listing.find({ category: cat }).limit(6);
    }

    res.locals.categories = categories;
    res.locals.categoryItems = categoryItems;
  } catch (err) {
    console.error("Navbar load error:", err);
    res.locals.categories = [];
    res.locals.categoryItems = {};
  }
  next();
});

// -------------------- Routes --------------------
app.use("/", adminRouter);
app.use("/cart", cartRoutes);
app.use("/user", userRouter); // includes Google + Local login routes
app.use("/", listingRouter);
app.use("/listing/:id", reviewsRouter);
app.use("/checkout", checkoutRoutes);
app.use("/location", locationRoutes);
app.use("/search", searchRoutes);
app.use("/resource", redirectBasedOnRole);
app.use("/store", storeRoute);





// -------------------- 404 Handler --------------------
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// -------------------- Error Handler --------------------
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).send(message);
});

// -------------------- Start Server --------------------
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
