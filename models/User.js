// Built-in modules
const crypto = require("crypto");
// Third-party modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    // match: [
    //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+s/,
    //   "Please add a valid email",
    // ],
    required: [true, "Please provide an email address"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    match: [
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      "Password must be 8 characters or more with a combination of letters and numbers",
    ],
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otpToken: String,
  otpExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Encrypt user password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign user token
userSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this.id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match req.body.password to user password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate user reset password link
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate user OTP link
userSchema.methods.getOTP = async function () {
  let otp = Math.floor(100000 + Math.random() * 900000);
  otp = otp.toString();

  // Encrypt OTP and save in current user's database
  const salt = await bcrypt.genSalt(10);
  this.otpToken = await bcrypt.hash(otp, salt);

  // Set the OTP Expiration to 30 minutes ahead
  this.otpExpire = Date.now() + 30 * 60 * 1000;

  return otp;
};

// Match req.body.otp to user otp
userSchema.methods.verifyOTP = async function (enteredOTP) {
  return await bcrypt.compare(enteredOTP, this.otpToken);
};

exports.User = mongoose.model("User", userSchema);
