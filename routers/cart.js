const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing"); // your product model
const Cart = require("../models/cart");
const {isLoggedIn}=require("../middleware")

// 🛒 Add to Cart
// ✅ Add to cart
// 🛍️ View Cart
// View cart
router.get("/view", async (req, res) => {
    if (!res.locals.currUser) {
        req.flash("error", "You must be logged in to view cart");
        return res.redirect("/login");
    }

    const userId = req.user._id;

    try {
        const cart = await Cart.findOne({ user: userId })
            .populate("items.product");
            console.log(cart);
            

        if (!cart || cart.items.length === 0) {
            req.flash("error", "🛒 Your cart is empty.");
            return res.redirect("/listing"); // redirect to shop instead of just plain text
        }

        cart.items = cart.items.filter(item => item.product !== null);
await cart.save();
res.render("cart/index", { cart });

    } catch (err) {
        console.error("Error fetching cart:", err);
        req.flash("error", "Something went wrong while loading your cart.");
        res.redirect("/listings");
    }
});


router.post("/add/:id", isLoggedIn, async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Listing.findById(productId);

    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/listing");
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    console.log("---------------------------------------------------------------------------------------------------------------------,product.price");
    
    const existingItem = cart.items.find(item => item.product.equals(product._id));
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        product: product._id,
        quantity: 1,
        price: product.price || 0   // ensure price
      });
    }
    console.log("---------------------------------------------------------------------------------------------------------------------,product.price");
    
    // fix old items with missing price
    cart.items.forEach(async (item, i) => {
      if (!item.price) {
        const p = await Listing.findById(item.product);
        item.price = p ? p.price : 0;
      }
    });
    
    console.log("---------------------------------------------------------------------------------------------------------------------,product.price");
    console.log(product.price);
    
    await cart.save();
    console.log("---------------------------------------------------------------------------------------------------------------------,product.price");
    req.flash("success", "Product added to cart!");
    res.redirect("/cart/view");

  } catch (err) {
    console.error("Error adding to cart:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/listing");
  }
});


// ✅ Remove from cart
// REMOVE item from cart
router.delete("/remove-from-cart/:id", isLoggedIn, async (req, res) => {
  try {
    const productId = req.params.id;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      req.flash("error", "Cart not found");
      return res.redirect("/cart/view");
    }

    // filter out the item with the given productId
    cart.items = cart.items.filter(item => !item.product.equals(productId));

    await cart.save();

    req.flash("success", "Item removed from cart!");
    res.redirect("/cart/view");

  } catch (err) {
    console.error("Error removing from cart:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/cart/view");
  }
});



// 🗑️ Clear the entire cart
router.post("/clear", async (req, res) => {
  try {
    const userId = req.user._id; // assuming user is logged in

    // find the user's cart and empty it
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }, // empty the items array
      { new: true }
    );

    res.redirect("/cart/view");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error clearing cart");
  }
});

module.exports = router;











