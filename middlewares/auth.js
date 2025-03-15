const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
  try {
    //extract token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer", "");

    //if token is missng return res

    //verify the token
    try {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
    } catch (err) {
      //token verification issue
      return res.status().json({
        success: false,
        message: "Token is Invalid",
      });
    }
    next();
  } catch (error) {
    console.log("Something went wrong while validating the token");
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//isStudent
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for student",
      });
    }
    next();
  } catch (error) {
    console.log("Something went wrong i isStudent middleware", error.message);
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified ,Please try again",
    });
  }
};

//Instructor
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for instructor",
      });
    }
    next();
  } catch (error) {
    console.log("Error Occured in isInstructor Middleware", error.message);
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, Please try again",
    });
  }
};

//Admin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admin Only",
      });
    }
    next();
  } catch (error) {
    console.log("Error Occured in Admin Middleware", error.message);
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, Please try again",
    });
  }
};
