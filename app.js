require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const ExpressError = require("./utils/ExpressError.js");

// ✅ Models
const User = require("./models/users.js"); // 🧠 You missed this line earlier!
const Listing = require("./models/listing.js");

// ✅ Routers
const listingRouter = require("./routers/listing.js");
const reviewsRouter = require("./routers/reviews.js");
const adminRouter = require("./routers/admin.js");
const cartRoutes = require("./routers/cart.js");
const checkoutRoutes = require("./routers/checkout.js");
const locationRoutes = require("./routers/location.js");
const searchRoutes = require("./routers/search.js");
const redirectBasedOnRole = require("./routers/resource.js");
const storeRoute = require("./routers/store.js");
const profileRoutes = require("./routers/profile");

// -------------------- Socket.IO Setup --------------------
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Passing io into user router (for real-time notifications)
const userRoutes = require("./routers/users")(io);

// Make io available to other routes
app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("checkUsername", async (username) => {
    try {
      const user = await User.findOne({ username });
      socket.emit("usernameStatus", { exists: !!user });
    } catch (err) {
      console.error("Socket checkUsername error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
// -------------------- View Engine + Middleware --------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// -------------------- Session + Flash --------------------
app.use(
  session({
    secret: "one-piece", // your secret string (can be anything)
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 24 * 60 * 60 * 1000, // expires in 1 day
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);
app.use(flash());

// -------------------- Passport Config --------------------
app.use(passport.initialize());
app.use(passport.session());

// 🧩 Local login using username + password
passport.use(new LocalStrategy(User.authenticate()));

// 🧩 Google login setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/user/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) return done(null, existingUser);

        // Otherwise create a new one
        const newUser = new User({
          username: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          role:
            profile.emails[0].value === "raghavtholambia@gmail.com"
              ? "admin"
              : "user",
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// 🧩 Serialize & Deserialize user (for login sessions)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// -------------------- MongoDB Connection --------------------
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");
}
main()
  .then(() => console.log("✅ MongoDB connected..."))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// -------------------- Global Variables Middleware --------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  res.locals.googleApiKey = process.env.GOOGLE_API_KEY;
  next();
});

// 🧩 Load categories for navbar
app.use(async (req, res, next) => {
  try {
    const categories = await Listing.distinct("category");
    const categoryItems = {};
    for (const cat of categories) {
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
app.use("/user", userRoutes); // ✅ using socket-aware user router
app.use("/", listingRouter);
app.use("/listing/:id", reviewsRouter);
app.use("/checkout", checkoutRoutes);
app.use("/location", locationRoutes);
app.use("/search", searchRoutes);
app.use("/resource", redirectBasedOnRole);
app.use("/store", storeRoute);
app.use("/profile", profileRoutes);


// -------------------- Error Handling --------------------
app.all("*", (req, res, next) => next(new ExpressError(404, "Page not found")));
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).send(message);
});

// -------------------- Start Server --------------------
server.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);






//  git add .
// git commit -m "update till LL"
//  git push origin main