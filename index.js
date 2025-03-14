const express = require("express");
const app = express();

const dbConnection = require("./config/database.js");
//server creation
app.listen(4000, () => {
  console.log(`Your Server is running on port no 4000`);
});

//dbconnection
dbConnection();
