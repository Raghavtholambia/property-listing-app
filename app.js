require("dotenv").config();
const express=require('express')
const app=express()
const mongoose=require("mongoose")
const path=require('path')
const methodOverride=require('method-override')
const ExpressError=require('./utils/ExpressError.js')
const listingRouter=require('./routers/listing.js')
const reviewsRouter=require('./routers/reviews.js')
const userRouter=require('./routers/users.js')
const session=require('express-session')
const flash=require('connect-flash')
const LocalStrategy=require('passport-local')
const passport = require('passport')
const User = require('./models/users.js');
const adminRouter = require('./routers/admin');
const cartRoutes = require('./routers/cart.js');
const checkoutRoutes = require("./routers/checkout");

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(session({
    secret:"one-piece",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1*24*60*60*1000,
        maxAge:1*24*60*60*1000,
        httpOnly:true
    }
}))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/test');
}
main().then(()=>{
    console.log("connected...");
}).catch((err)=>{
    console.log(err);
    
})

app.use((req,res,next)=>{
    const successMsg = req.flash("success");
    const errorMsg = req.flash("error");
    res.locals.success=successMsg
    res.locals.error=errorMsg
    
    res.locals.currUser=req.user || null
    next()
})

// Specific routes first
app.use('/', adminRouter);
app.use('/cart', cartRoutes);
app.use('/', userRouter);

// THEN listing routes
app.use("/listing/:id", reviewsRouter);  // Make sure this is the right path
app.use("/listing", listingRouter);
app.use("/checkout", checkoutRoutes);


// Catch-all 404 after all routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).send(message);
});

app.listen(3000,()=>{
    console.log("listening");
})