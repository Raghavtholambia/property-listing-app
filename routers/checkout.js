const express = require("express");
const router = express.Router();
router.use(express.json());               // ✅ for JSON body
router.use(express.urlencoded({ extended: true })); // ✅ for form data
const Razorpay = require("razorpay");

// 🟢 UPI Payment
// Handle UPI Payment
router.post("/pay/upi", (req, res) => {
  const { upiId, amount } = req.body;

  console.log("UPI Payment:", upiId, amount);

  res.json({
    success: true,
    message: "UPI Payment Successful",
    upiId,
    amount
  });
});

// 🟢 Card Payment
router.post("/pay/card", (req, res) => {
  const { cardNumber, name, expiry, cvv, amount } = req.body;
  console.log("Card Payment:", cardNumber, name, expiry, amount);

  // Later: Integrate with Stripe / Razorpay
  res.json({ success: true, message: `Card Payment request for ₹${amount} received.` });
});

// 🟢 Cash on Delivery
router.post("/pay/cod", (req, res) => {
  const { amount } = req.body;
  console.log("COD Order:", amount);

  // Later: Save order in DB with "COD" as payment status
  res.json({ success: true, message: `Order placed. Pay ₹${amount} on delivery.` });
});


// 🔑 Replace with your Razorpay keys
const razorpay = new Razorpay({
  key_id: "YOUR_KEY_ID",
  key_secret: "YOUR_KEY_SECRET"
});

// ✅ Create Order API
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body; // frontend sends amount in INR

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating order" });
  }
});

module.exports = router;
