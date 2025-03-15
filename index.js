const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const dbConnection = require("./config/database.js");
//server creation
app.listen(4000, () => {
  console.log(`Your Server is running on port no 4000`);
});

//parse json data
app.use(express.json());

//cookie parser
app.use(cookieParser());

//dbconnection
dbConnection();
