import express from "express";
const router = express.Router();
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getOTP,
  verifyOTP,
} from "../controllers/auth.js";

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").put(resetPassword);
router.route("/get-user-otp").post(getOTP);
router.route("/verify-user-otp").post(verifyOTP);

export default router;
