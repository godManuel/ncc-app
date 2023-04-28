const express = require("express");
const app = express();
require("dotenv").config();

// Import routes
const auth = require("./routes/auth");

// Middlewares
const errorHandler = require("./middleware/error");
const notFound = require("./middleware/notFound");

// MongoDB Connection
const connectDB = require("./config/mongo-db");
connectDB();

// Express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use("/api/v1/auth", auth);

// Mount middlewares
app.use(notFound);
app.use(errorHandler);

const port = 8080 || process.env.PORT;

app.listen(port, () => {
  console.log(`App server running on port ${port}`);
});
