 Setup Instructions
1. Install Dependencies of  Backend
Make sure we have Node. installed. Then, navigate to the backend folder, install required dependencies:
npm install 
2. Start the Server
Navigate to the backend folder and run:
node server.js

Our server will start at http://localhost:5000.

3. Intsall Dependencies of frontend
npm install 
4. Start the Frontend
Navigate to our frontend folder and run:
npm run dev

Our frontend will be available at http://localhost:5173.

   Abuse Prevention Strategies Explained
1. IP-Based Restriction (Server-side)
The server records each user's IP address (req.ip) when they claim a coupon.
If they try to claim again within 30 minutes, they receive an error message with the remaining wait time.
2. Cookie-Based Restriction (Browser-side)
A cookie (couponClaimed) is set in the browser for 30 minutes.
If the same browser tries to claim another coupon before the cooldown expires, they get blocked.
3. Sequential Coupon Assignment
Uses a round-robin method (couponIndex) to ensure even distribution of coupons to users.

 Code Explanation
  Backend: server. (Node. + Express)
This is responsible for handling coupon distribution and abuse prevention.

1️. Import Dependencies

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");

express → Handles API requests.
cors → Allows frontend (http://localhost:5173) to communicate with the server.
cookie-parser → Parses cookies in requests.
fs → Used for saving coupon data to a file (usedCoupons.on).
2. Initialize Express Server

const app = express();
const PORT = 5000;

The app runs on port 5000.
3️. Apply Middleware

app.use(express.on());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

Enables ON parsing, cookie handling, and allows requests from the frontend.
4️. Coupon List & Tracking Variables


let coupons = ["DISCOUNT10", "OFFER20", "SALE30", "PROMO50", "DISCOUNT40", "DISCOUNT60"];
let usedCoupons = {}; 
let couponIndex = 0;

Stores available coupons.
usedCoupons → Tracks users who have claimed a coupon (IP-based).
couponIndex → Ensures sequential coupon distribution.
5️. Reset Used Coupons on Server Restart


const resetUsedCoupons = () => {
  usedCoupons = {};
  fs.writeFileSync("usedCoupons.on", ON.stringify(usedCoupons, null, 2));
};
resetUsedCoupons();

Clears the usedCoupons.on file when the server starts.
6️. Claim Coupon API (POST /claim)


app.post("/claim", (req, res) => {
  res.clearCookie("couponClaimed");
  const userIP = req.ip;
  const userCookie = req.cookies.couponClaimed;
  const now = Date.now();
  const cooldownPeriod = 30 * 60 * 1000; // 30 minutes

Clears any existing cookies before setting a new one.
Extracts IP address and cookie data from the request.
 Check if the User is Blocked by IP


 if (usedCoupons[userIP]) {
    const timeElapsed = now - usedCoupons[userIP];
    if (timeElapsed < cooldownPeriod) {
      return res.status(400).on({
        message: `You have already claimed a coupon. Try again in ${Math.ceil((cooldownPeriod - timeElapsed) / 60000)} minutes!`,
      });
    }
  }

If the IP exists in usedCoupons, the server calculates the time left and blocks the user if it’s within 30 minutes.
 Check if the User is Blocked by Cookies


 if (userCookie) {
    return res.status(400).on({ message: "You have already claimed a coupon. Try again later!" });
  }

If the browser cookie (couponClaimed) is set, the user is blocked.
 Assign a Coupon & Save the Data


 const coupon = coupons[couponIndex];
  couponIndex = (couponIndex + 1) % coupons.length;
  usedCoupons[userIP] = now;
  res.cookie("couponClaimed", "true", { maxAge: cooldownPeriod, httpOnly: true });
  fs.writeFileSync("usedCoupons.on", ON.stringify(usedCoupons, null, 2));
  res.on({ success: true, coupon });
});

Assigns a coupon sequentially using couponIndex.
Stores the claim timestamp for the user's IP.
Sets a browser cookie to enforce session-based tracking.
7️. Start the Server


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

Starts the Express server on port 5000.

🔹 Frontend: App.x (React + Axios + Tailwind CSS)
The frontend allows users to claim a coupon, see errors, and wait for the cooldown to expire.
1️. Import Dependencies


import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

useState / useEffect → Handles state and UI updates.
axios → Sends API requests to the backend.
react-toastify → Displays error messages and success toasts.
2️. State Variables


const [coupon, setCoupon] = useState(null);
const [cooldown, setCooldown] = useState(0);
const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

coupon → Stores the claimed coupon.
cooldown → Tracks the remaining wait time for claiming a new coupon.
darkMode → Stores dark mode settings.
3️. Auto-Update Cooldown Timer


useEffect(() => {
  if (cooldown > 0) {
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }
}, [cooldown]);

Decreases the cooldown every 1 second when active.
4️. Claim Coupon Function


const claimCoupon = async () => {
  if (cooldown > 0) return;
  setLoading(true);
  try {
    const res = await axios.post("http://localhost:5000/claim", {}, { withCredentials: true });
    setCoupon(res.data.coupon);
    toast.success(`🎉 Coupon Claimed: ${res.data.coupon}`);
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Error claiming coupon";
    toast.error(errorMsg);
    const match = errorMsg.match(/(\d+) minutes/);
    if (match) setCooldown(parseInt(match[1], 10) * 60);
  }
  setLoading(false);
};

Calls the API, handles errors, and sets the cooldown time if needed.

