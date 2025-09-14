require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routers/listing.js");
const reviewsRouter = require("./routers/reviews.js");
const userRouter = require("./routers/users.js");
const session = require("express-session");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const passport = require("passport");
const User = require("./models/users.js");
const adminRouter = require("./routers/admin");
const cartRoutes = require("./routers/cart.js");
const checkoutRoutes = require("./routers/checkout");
const locationRoutes = require("./routers/location.js");

// ✅ Import Listing schema for navbar categories
const Listing = require("./models/listing");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// 🔹 Sessions + flash
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

// 🔹 Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 🔹 MongoDB connect
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");
}
main()
  .then(() => {
    console.log("connected...");
  })
  .catch((err) => {
    console.log(err);
  });

// 🔹 Flash + current user middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  next();
});

// 🔹 Navbar middleware → inject categories & sample items
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

// 🔹 Routes
app.use("/", adminRouter);
app.use("/cart", cartRoutes);
app.use("/", userRouter);
app.use("/listing/:id", reviewsRouter);
app.use("/listing", listingRouter);
app.use("/checkout", checkoutRoutes);
app.use("/location", locationRoutes);

// 🔹 404 handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// 🔹 Error handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).send(message);
});

// 🔹 Start server
app.listen(3000, () => {
  console.log("listening on port 3000");
});
