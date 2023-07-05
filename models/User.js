// Built-in modules
import crypto from "crypto";
// Third-party modules
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    // match: [
    //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+s/,
    //   "Please add a valid email",
    // ],
  },
  password: {
    type: String,
    // match: [
    //   /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
    //   "Password must be 8 characters or more with a combination of letters and numbers",
    // ],
    select: false,
  },
  mobile: String,
  provider: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  phoneOTP: String,
  phoneOTPExpire: String,
  emailOTP: String,
  emailOTPExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

/* TASK -> Encrypt user password */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* TASK -> Sign user token */
userSchema.methods.getSignedToken = function () {
  return jwt.sign(
    { id: this.id, email: this.email, name: this.name, mobile: this.mobile },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

/* TASK -> Match req.body.password to user password */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* TASK -> Generate user reset password link */
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

/* TASK -> Generate user OTP for Email Verification */
userSchema.methods.getEmailOTP = async function () {
  let otp = Math.floor(100000 + Math.random() * 900000);
  otp = otp.toString();

  // Encrypt OTP and save in current user's database
  const salt = await bcrypt.genSalt(10);
  this.emailOTP = await bcrypt.hash(otp, salt);

  // Set the OTP Expiration to 30 minutes ahead
  this.emailOTPExpire = Date.now() + 30 * 60 * 1000;

  return otp;
};

/* TASK -> Compare emailOTP with req.body.emailOTP  */
userSchema.methods.verifyEmailOTP = async function (enteredOTP) {
  return await bcrypt.compare(enteredOTP, this.emailOTP);
};

/* TASK -> Generate user OTP for Mobile Verification */
userSchema.methods.getPhoneOTP = async function () {
  let otp = Math.floor(100000 + Math.random() * 900000);
  otp = otp.toString();

  // Encrypt OTP and save in current user's database
  const salt = await bcrypt.genSalt(10);
  this.phoneOTP = await bcrypt.hash(otp, salt);

  // Set the OTP Expiration to 30 minutes ahead
  this.phoneOTPExpire = Date.now() + 30 * 60 * 1000;

  return otp;
};

/* TASK -> Compare phoneOTP with req.body.phoneOTP */
userSchema.methods.verifyPhoneOTP = async function (enteredOTP) {
  return await bcrypt.compare(enteredOTP, this.phoneOTP);
};

const User = mongoose.model("User", userSchema);

export { User };
