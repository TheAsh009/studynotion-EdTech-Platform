const Course = require("../models/Course");
const Category = require("../models/category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createCourse = async (req, res) => {
  try {
    //fetch the data
    const {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category,
      tag,
    } = req.body;

    //get thumbnail
    const thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !thumbnail ||
      !price ||
      !category ||
      !tag
    ) {
      return res.status(401).json({
        success: false,
        message: "Please Provide all the fields",
      });
    }

    //check for the instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById({ id: userId });
    console.log("Instructor Details", instructor);

    if (!instructorDetails) {
      return res.status(401).json({
        success: false,
        message: "Instructor Details not found",
      });
    }

    //check given tag is valid or not
    const categoryDetails = await Category.findById(tag);

    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag Details not found",
      });
    }

    //upload image to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //create an entry for new course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag: tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    //add the new course to the user schema of instructor
    await User.findByIdAndUpdate(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      {
        new: true,
      }
    );

    //update the tag schema
    await Category.findByIdAndUpdate(
      { _id: categoryDetails._id },
      { $push: { course: newCourse._id } },
      { new: true }
    );

    //return successful response
    return res.status(200).json({
      success: true,
      message: "Course is created Successfully",
      data: newCourse,
    });
  } catch (error) {
    console.log("error occured in the course create course", error.message);
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

exports.showAllCoureses = async (req, res) => {
  try {
    const allCourse = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        studentsEnrolled: true,
        instructor: true,
        ratingAndReviews: true,
      }
    )
      .populate()
      .exec();

    return res.status(200).json({
      success: true,
      message: "All courses are fetched successfully",
      allCourse,
    });
  } catch (error) {
    console.log("Error Occured in the showAllCourses", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
