import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();

// Import routes
import home from "./routes/index.js";
import googleAuth from "./routes/google-auth.js";
import emailAuth from "./routes/email-auth.js";
import users from "./routes/users.js";

// Middlewares
import errorHandler from "./middleware/error.js";
import notFound from "./middleware/notFound.js";

// MongoDB Connection
import connectDB from "./config/db.js";
connectDB();

// Express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use("/", home);
app.use("/api/v1/google-auth", googleAuth);
app.use("/api/v1/auth", emailAuth);
app.use("/api/v1/users", users);

// Mount middlewares
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`App server running on port ${port}`);
});
