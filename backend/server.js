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
let coupons = [
  "DISCOUNT10",
  "OFFER20",
  "SALE30",
  "PROMO50",
  "DISCOUNT40",
  "DISCOUNT60",
];
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

  const now = Date.now();

  // 30 minutes in milliseconds
  const cooldownPeriod = 30 * 60 * 1000;

  // IP Tracking: Restrict claims from the same IP within 30 minutes
  if (usedCoupons[userIP]) {
    const timeElapsed = now - usedCoupons[userIP];
    const timeLeft = cooldownPeriod - timeElapsed;

    if (timeElapsed < cooldownPeriod) {
      return res.status(400).json({
        message: `You have already claimed a coupon. Try again in ${Math.ceil(
          timeLeft / 60000
        )} minutes!`,
      });
    }
  }

  // 🔹 Cookie Tracking: Restrict claims from the same browser session
  if (userCookie) {
    return res.status(400).json({
      message: "You have already claimed a coupon. Try again later!",
    });
  }

  // Get a coupon using round-robin logic
  const coupon = coupons[couponIndex];
  couponIndex = (couponIndex + 1) % coupons.length;

  // Mark this user as claimed with a timestamp
  usedCoupons[userIP] = now;
  res.cookie("couponClaimed", "true", {
    maxAge: cooldownPeriod,
    httpOnly: true,
  });

  saveUsedCoupons();

  res.json({ success: true, coupon });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
