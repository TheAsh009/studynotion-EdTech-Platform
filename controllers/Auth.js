const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const s = require("../utils/mailSender");
//sendOtp
exports.sendOTP = async (req, res) => {
  try {
    //fetch email from req body
    const email = req.body.email;

    //check is user already Exist
    const checkUserPresent = await User.findOne({ email });

    //if user is already exist ,then a res
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User is already exist Please Login",
      });
    }

    //GENERATE otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP GENERATED", otp);

    //check unique otp or not
    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    //create entry in db for OTP
    const otpBody = await OTP.create(otpPayload);

    console.log(otpBody);

    return res.status(200).json({
      success: true,
      message: "OTP Send Successfully",
      otp,
    });
  } catch (error) {
    console.log("Error Occured in sendOTP function", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//sign Up
exports.signUp = async (req, res) => {
  try {
    //data fetch from req body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contectNumber,
      otp,
    } = req.body;

    //validate data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "Please Fill All the Fields",
      });
    }

    //confirm Password Match
    if (password !== confirmPassword) {
      return res.status(403).json({
        success: false,
        message: "Password and Confirm Password value does Not Match",
      });
    }

    //check user already exist or not
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Exist" });
    }

    //find the most recent OTP

    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log("RECENT OTP", recentOtp);

    //validate the OTP
    if (recentOtp.length === 0) {
      //OTP NOT FOUND
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: "OTP does not match",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      contectNumber,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      message: "User Created Successfully",
      user,
    });
  } catch (error) {
    console.log("Error Occured in signUp function", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Log In
exports.login = async (req, res) => {
  try {
    //fetch the data from req body
    const { email, password } = req.body;

    //validate data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "Please Fill All the Fields",
      });
    }

    //check user exist or not
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User Does Not Exist Please Sign Up",
      });
    }
    //hash password
    const hashedPassword = bcrypt.hash(password, 10);
    let payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
    };

    //compare the password and generate jwt token
    if (await bcrypt.compare(hashedPassword, user.password)) {
      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      user.token = token;
      user.password = undefined;

      //create cookie and send response
      return res
        .cookie("token", token, {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        })
        .status(200)
        .json({
          success: true,
          message: "User Logged In Successfully",
          token,
        });
    } else {
      console.log("Password Does Not Match");
      return res.status(401).json({
        success: false,
        message: "Password Does Not Match",
      });
    }
  } catch (error) {
    console.log("Error Occured in login function", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//change Password
exports.changePassword = async (req, res) => {
  try {
    //fetch the data from req body
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    //validate data
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(403).json({
        success: false,
        message: "Please Fill All the Fields",
      });
    }

    //find the User
    const user = await User.findOne({ email });

    //validate the new password and confirm password
    if (newPassword !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "New Password and Confirm Password does not match",
      });
    }

    //compare the old password
    if (user.password !== oldPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Old Password Does Not Match" });
      //if match
    } else if (user.password === oldPassword) {
      //hash new Pass
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      //update new Pass in DB
      const updatedUser = await User.findOneAndUpdate({
        password: hashedPassword,
      });

      //send Mail to user password change successfully

      //return res
      return res.status(200).json({
        success: true,
        message: "Password Changed Successfully",
      });
    }
  } catch (error) {
    console.log("Erorr Occured in changePassword function", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
