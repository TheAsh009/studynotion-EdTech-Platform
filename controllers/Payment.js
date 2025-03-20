const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");

//capture the paymeny and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  //get courseId and User Id
  const { course_id } = req.body;
  const userId = req.user.id;
  //validation

  if (!course_id) {
    return res.status(401).json({
      success: false,
      message: "Please Valid the course ID",
    });
  }
  //valid coursedetails
  let course;
  try {
    course = await Course.findById(course_id);

    if (!course) {
      return res.status(401).json({
        success: false,
        message: "Could not find the course",
      });
    }

    //user already pay for the same course
    const uid = new mongoose.Types.ObjectId(userId);

    if (course.studentsEnrolled.includes(uid)) {
      return res.status(200).json({
        success: false,
        message: "Student is already enrolled",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }

  //order create
  const amount = course.price * 100;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      courseId: course_id,
      userId,
    },
  };

  try {
    //initiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    //return response
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.log("Error Occured while creating an order", error.message);
    return res.status(401).json({
      success: false,
      message: "Could nnot initiate order",
    });
  }
};

//verifysignature of razorpay and server

exports.verifySignature = async (req, res) => {
  const webhook = "12345678";

  const signature = req.headers("x-razorpay-signature");
  const shasum = crypto.createHmac("sha256", webhookSecret);

  shasum.update(JSON.stringify(req.body));

  if (signature === digest) {
    console.log("Payment is Authorized");
    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      //fulfull the action
      //find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        {
          _id: courseId,
        },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course not found",
        });
      }
      console.log("EnrolledCourse", enrolledCourse);
      //find the student added the course to their enrolled courses
      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );
      console.log("EnrolledStudent", enrolledStudent);

      //confirmation mail send'
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulation You are onboarded on new course",
        ""
      );
      console.log("Email Response", emailResponse);
      return res.status(200).json({
        success: true,
        message: "Signature Verified",
      });
    } catch (error) {
      console.log(
        "Error Occured in verify signature controller",
        error.message
      );
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid Request",
    });
  }
};
