const Course = require("../models/Course");
const Profile = require("../models/Profile");
const User = require("../models/User");

//update profile
exports.updateProfile = async (req, res) => {
  try {
    //get the data
    const { dateOfBirth = "", about = "", gender, contactNumber } = req.body;
    //get the userId
    const id = req.user.id;
    //validation
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "Contact Number and gender is mandetory",
      });
    }
    //find profile
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    //upate profile
    const profileDetails = await Profile.findById(profileId);

    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    await profileDetails.save();

    //return response
    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      profileDetails,
    });
  } catch (error) {
    console.log(
      "Error Occured in the update profile controller",
      error.message
    );
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//delete Account
exports.deleteAccount = async (req, res) => {
  try {
    //get id
    const id = req.user.id;
    //validate the inputted id
    const userDetails = await User.findById(id);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not Found",
      });
    }

    //delete users pofile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    //delete user
    await User.findByIdAndDelete({ _id: id });

    //dont delete immediatly schedule the delete account request(crone Job)
    //update the course
    // const courseDetails = await Course.findById({
    //   studentEnrolled: id,
    // });
    //return response
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(
      "Error Occured in the delete Profile controller",
      error.message
    );
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

//get ALL user details
exports.getAlluserDetails = async (req, res) => {
  try {
    //get Id
    const id = req.user.id;
    //validation and get the user details
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    //return response
    return res.status(200).json({
      success: true,
      messgage: "User data fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delte section,please try again",
      error: error.message,
    });
  }
};
