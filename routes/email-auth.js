import express from "express";
const router = express.Router();
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyOTP,
  addUserInfo,
} from "../controllers/email-auth.js";

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").put(resetPassword);
router.route("/verify-user-otp").post(verifyOTP);
router.route("/:userId/add-name").post(addUserInfo);

export default router;
