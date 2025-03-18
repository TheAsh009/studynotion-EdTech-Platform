const Section = require("Section");
const Course = require("Course");

exports.createSection = async (req, res) => {
  try {
    //fetch data
    const { sectionName, courseId } = req.body;

    //data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }

    //create section
    const newSection = await Section.create({ sectionName });

    //update the course with the section objectId
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          courseContent: newSection,
        },
      },
      {
        new: true,
      }
    );
    //populate both subsection and section
    //return response
    return res.status(200).json({
      success: true,
      message: "Section created Successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    console.log("Error Occured in the create section function", error.message);
    return res.status(401).json({
      success: false,
      message: `Unable to create section ${error.message}`,
    });
  }
};

//updateSection
exports.updateSection = async () => {
  try {
    //data input
    const { sectionName, sectionId } = req.body;

    //data validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }

    //update data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    //return response
    return res.status(200).json({
      success: true,
      message: "Section updated Successfully",
    });
  } catch (error) {
    console.log("Error Occured in the Update section", error.message);
    return res.status(401).json({
      success: false,
      message: `Error occured in updateSection ${error.message}`,
    });
  }
};

//delete section
exports.deleteSection = async (req, res) => {
  try {
    //fetch data get id
    const { sectionId } = req.params;

    //user findByIdAnd Delete
    await Section.findByIdAndDelete(sectionId);

    //return response
    return res.status(200).json({
      success: true,
      message: "Section Deleted Successfully",
    });
  } catch (error) {
    console.log("error Occured in the delete section", error.message);
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
