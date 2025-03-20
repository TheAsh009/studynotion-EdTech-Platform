const Razorpay = require("razorpay");
require("dotenv").config();

//instance creation
exports.instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});
