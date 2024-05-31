const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const dbConnect = require("./config/dbConnect");
dbConnect()
// Load environment variables from .env file
dotenv.config();
const app = express();
const port = process.env.PORT || 6000;
const authRouter = require("./routes/authRoute");


// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use("/api/user", authRouter);
app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
