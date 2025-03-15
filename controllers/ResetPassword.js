const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//reset Password Token
exports.resetPasswordToken = async (req, res) => {
  try {
    //fetch the data from req  body
    const { email } = req.body;

    //validate the email
    if (!email) {
      return res.status(500).json({
        success: false,
        message: "Please Provide Email",
      });
    }

    //check the user for this email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Your Email is not registered",
      });
    }

    //generate token
    const token = crypto.randomUUID();

    //update user by adding the token and Expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );

    //create url to reset the password
    const url = `http://localhost:3000/update-password/${token}`;
    //send mail containing the url
    await mailSender(email, "Password Reset Link", `Password Reset Url ${url}`);

    //return res
    return res.status().json({
      success: true,
      message: "Email sent successfully,please check email and change password",
    });
  } catch (error) {
    console.log("Error Occured in ResetPassword", error.message);
    return res.status(401).json({
      success: false,
      message: "Error Occured in ResetPassword Token",
    });
  }
};

//update the reset password in to db
exports.resetPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body;
    //validation
    if (!password || !confirmPassword || !token) {
      return res.status().json({
        success: false,
        message: "Password and conform Password does not match",
      });
    }
    //get userdetails from db using token
    const userDetails = await User.findOne({ token: token });

    //if not entry for that token - invalid token
    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token",
      });
    }

    //check token time
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token Expired ,please regenerate the token",
      });
    }

    //hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ token: token }, { password: hashedPassword },{new::true});
    //return response
    return res.status(200).json({
        success:true,
        message:"Password Reset Successful"
    })
  } catch (error) {
    console.log("Error Occured in the update reset Password",error.message)
    return res.status(400).json({
        success:false,
        message:`Error Occured in updateResetPassword ${error.message}`
    }) 
  }
};
