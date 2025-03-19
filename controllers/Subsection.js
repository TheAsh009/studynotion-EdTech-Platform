const Subsection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const dotenv = require("dotenv");
dotenv.config();

//create subsection
exports.createSubsection = async (req, res) => {
  try {
    //fetch data from req body
    const { sectionId, title, description, timeDuration } = req.body;
    //extract video/file
    const video = req.files.videoFile;
    //validation
    if (!sectionId || !title || !timeDuration || !description) {
      return res.status(400).json({
        success: false,
        message: "All fileds are required",
      });
    }

    //upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    //create a sub section
    const subsectionDetails = await Subsection.create({
      title,
      description,
      timeDuration,
      videoUrl: uploadDetails.secure_url,
    });

    //update section with the subsection ObjId
    const updatedSectiton = await Section.findByIdAndUpdate(
      { sectionId },
      { $push: { subSection: subsectionDetails._id } },
      { new: true }
    ).populate();

    console.log("Updated Section", updatedSectiton);

    //return res
    return res.status(200).json({
      success: true,
      message: "Subsection created Successfully",
      subsectionDetails,
    });
  } catch (error) {
    console.log(
      "Error Occured in the create subsection controller",
      error.message
    );
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

//update the subsection

exports.updateSubsection = async (req, res) => {
  try {
    ///fetch the data
    const { subsectionId, title, description, timeDuration } = req.body;

    //validate the dataa
    if (!subsectionId) {
      return res.status(403).json({
        success: false,
        message: "The Subsection ID is required",
      });
    }

    //check whether the subsection is valid or not
    const checkSubsectionisValid = await Subsection.findById(subsectionId);

    if (!checkSubsectionisValid) {
      return res.status(400).json({
        success: false,
        message: "Subsection is not valid",
      });
    }

    //update the subsection
    const updatedSubsectionDetails = await Subsection.findByIdAndUpdate(
      {
        _id: subsectionId,
      },
      { title, description, timeDuration },
      {
        new: true,
      }
    );

    //return the response
    return res.status(200).json({
      success: true,
      message: "SubSection Updated Successfully",
      updatedSubsectionDetails,
    });
  } catch (error) {
    console.log("Error Occured in the update Subsection", error.message);
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }
};
