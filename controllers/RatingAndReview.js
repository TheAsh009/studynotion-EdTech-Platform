const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

//create Rating
exports.createRating = async (req, res) => {
  try {
    //get user Id
    const userId = req.user.id;
    //fetchh data from req body
    const { rating, review, courseId } = req.body;
    //check if user is enrolled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in this course",
      });
    }
    //check if user is already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course is already reviewed by the user",
      });
    }
    //create reating and review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    //update course review
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: { ratingAndReviews: ratingReview._id },
      },
      {
        new: true,
      }
    );

    console.log(updatedCourseDetails);
    //return response
    return res.status(200).json({
      success: true,
      message: "Rating and Review created Successfully",
      ratingReview,
    });
  } catch (error) {
    console.log(
      "Error Occured in the Rating And Review Controller",
      error.message
    );
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }
};

//get Average Rating
exports.getAverageRating = async () => {
  try {
    // get course Id
    const courseId = req.body.courseId;
    //calculate avg rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    console.log("AverageRating", result);
    //return res
    if (result.length > 0) {
      return res.status(403).json({
        success: false,
        averageRating: result[0].averageRating,
      });
    }

    ///if not rating exist
    return res.status(200).json({
      success: true,
      message: "Average Rating  is 0 no rating given till now",
      averageRating: 0,
    });
  } catch (error) {
    console.log("Error Occured");
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

//getAll Rating And reviwes
exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "All Reviews fetched Successfully",
      data: allReviews,
    });
  } catch (error) {
    console.log(
      "Error Occured in the getAll Raing And Reviews Function",
      error.message
    );
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }
};
