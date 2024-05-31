const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect("mongodb://localhost:27017/ecommercapp", {
     
    });
    console.log(`Database Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = dbConnect;
