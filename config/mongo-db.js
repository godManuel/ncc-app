const mongoose = require("mongoose");

// Mongoose Strict Query
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb://localhost/ncc-app", {
      useNewUrlParser: true,
    });

    console.log(`MongoDB running: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
