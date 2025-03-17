const Category = require("../models/category");

//tag Creation
exports.createCategory = async (req, res) => {
  try {
    //fetch the data from req body
    const { name, description } = req.body;

    //validate the dataa
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
      });
    }

    //create entry in db
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    console.log(categoryDetails);
    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    });
  } catch (error) {
    console.log("Error Occured in the Category creation Controller");
    return res.status(401).json({
      success: true,
      message: error.message,
    });
  }
};

//getAlltags hanlder function
exports.showAllCategories = async (req, res) => {
  try {
    //get alll the data which consist of the name and description
    const allCategories = await Tag.find(
      {},
      {
        name: true,
        description: true,
      }
    );
    return res.status(200).json({
      success: true,
      message: "All Categories return successfully",
      allCategories,
    });
  } catch (error) {
    console.log("error Occured in the show All Categories");
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};
