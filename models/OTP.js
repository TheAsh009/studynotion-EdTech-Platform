const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// a function to send emails
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email From StudyNotion",
      otp
    );
    console.log("Email Send Successfully", mailResponse);
  } catch (error) {
    console.log(
      "Error Occured in the sendVerification Mail in OTP Model",
      error.message
    );
    throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
});

module.exports = mongoose.model("OTP", otpSchema);
