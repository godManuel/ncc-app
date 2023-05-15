const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getOTP,
  verifyOTP,
} = require("../controllers/auth");
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").put(resetPassword);
router.route("/get-user-otp").post(getOTP);
router.route("/verify-user-otp").post(verifyOTP);

module.exports = router;
