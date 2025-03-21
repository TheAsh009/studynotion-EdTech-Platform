const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoute = require("./routes/Profile");
const paymentRoute = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

const cookieParser = require("cookie-parser");
const dbConnection = require("./config/database.js");

const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
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

//middlewars
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

//cloudinary Connection
cloudinaryConnect();

//mount routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoute);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoute);

//.default route

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: `<h1>Your Server is up and running...</h1>`,
  });
});
