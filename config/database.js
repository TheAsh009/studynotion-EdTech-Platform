const mongoose = require("mongoose");
require("dotenv").config();

const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("DB Connection Successful");
    })
    .catch((error) => {
      console.log("DB Connection Failed", error.message);
      process.exit(1);
    });
};

module.exports = dbConnection;
