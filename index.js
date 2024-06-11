const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const dbConnect = require("./config/dbConnect");
dbConnect()
// Load environment variables from .env file
const cookieParser = require('cookie-parser');
dotenv.config();
const app = express();
const port = process.env.PORT || 6000;
const authRouter = require("./routes/authRoute");
const categoryRouter = require("./routes/prodcategoryRoute");
const productRouter =require("./routes/productRoute")
const brandRouter = require("./routes/brandRoute");
const colorRouter = require("./routes/colorRoute");
const blogcategoryRouter = require("./routes/blogCatRoute");
const couponRouter = require("./routes/couponRoute");
const enqRouter = require("./routes/enqRoute");
const blogRoute =require("./routes/blogRoute")
app.use(cookieParser());
// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use("/api/user", authRouter);
app.use("/api/blog", blogRoute);
app.use("/api/blogcategory", blogcategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/enquiry", enqRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/color", colorRouter);
app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
