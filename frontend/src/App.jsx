import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [coupon, setCoupon] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const claimCoupon = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/claim",
        {},
        { withCredentials: true }
      );
      setCoupon(res.data.coupon);
      setError(null);
      toast.success(`🎉 Coupon Claimed: ${res.data.coupon}`);
    } catch (err) {
      setError(err.response?.data?.message || "Error claiming coupon");
      toast.error(err.response?.data?.message || "Error claiming coupon");
    }
    setLoading(false);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 text-center transition-all duration-500 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
      }`}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-6 right-6 px-4 py-2 rounded-full bg-gray-800 text-white dark:bg-white dark:text-gray-900 shadow-md hover:scale-110 transition-all"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      {/* Floating Title */}
      <h1 className="text-5xl font-extrabold mb-8 animate-fade-in">
        🎟️ Exclusive Coupons Just for You!
      </h1>

      {/* Main Box */}
      <div className="w-full max-w-4xl bg-white/20 backdrop-blur-lg shadow-xl rounded-3xl p-10 border border-white/30 transition-all hover:scale-105">
        <p className="text-white text-lg mb-6">
          Click the button below to get your **exclusive discount coupon**!
        </p>

        {/* Claim Button */}
        <div className="flex justify-center">
          <button
            onClick={claimCoupon}
            className="relative bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold py-4 px-12 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
            disabled={loading}
          >
            {loading ? "Claiming..." : "🎁 Claim Coupon"}
          </button>
        </div>

        {/* Coupon Display */}
        {coupon && (
          <p className="mt-6 text-3xl text-green-400 font-bold animate-pulse">
            🎉 Your Coupon:{" "}
            <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              {coupon}
            </span>
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className="mt-6 text-red-400 text-xl font-semibold">⚠️ {error}</p>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}

export default App;
