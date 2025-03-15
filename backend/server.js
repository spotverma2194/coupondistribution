const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Coupons List
let coupons = ["DISCOUNT10", "OFFER20", "SALE30", "PROMO50"];
let usedCoupons = {};

// Round-robin index
let couponIndex = 0;

// Function to reset used coupons on server restart
const resetUsedCoupons = () => {
  usedCoupons = {};
  fs.writeFileSync("usedCoupons.json", JSON.stringify(usedCoupons, null, 2));
  console.log("Reset usedCoupons.json successfully!");
};

// Function to save used coupons data
const saveUsedCoupons = () => {
  fs.writeFileSync("usedCoupons.json", JSON.stringify(usedCoupons, null, 2));
  console.log("usedCoupons.json updated successfully!");
};

resetUsedCoupons();

// Claim a coupon
app.post("/claim", (req, res) => {
  res.clearCookie("couponClaimed"); // Clear old cookies
  const userIP = req.ip;
  const userCookie = req.cookies.couponClaimed;

  // Check if the user has already claimed a coupon
  if (usedCoupons[userIP] || userCookie) {
    return res
      .status(400)
      .json({ message: "You have already claimed a coupon. Try again later!" });
  }

  // Get a coupon using round-robin logic
  const coupon = coupons[couponIndex];
  couponIndex = (couponIndex + 1) % coupons.length;

  // Mark this user as claimed
  usedCoupons[userIP] = true;
  res.cookie("couponClaimed", "true", { maxAge: 3600000, httpOnly: true }); // 1-hour restriction

  saveUsedCoupons(); // Save updated data

  res.json({ success: true, coupon });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
