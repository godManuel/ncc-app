import express from "express";
const router = express.Router();
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  addName,
  addPhoneNumber,
  verifyPhoneNumber,
  setPassword,
} from "../controllers/email-auth.js";

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").put(resetPassword);
router.route("/verify-user-otp").post(verifyEmail);
router.route("/:userId/add-name").put(addName);
router.route("/:userId/add-phone-number").put(addPhoneNumber);
router.route("/:userId/verify-phone-number").post(verifyPhoneNumber);
router.route("/:userId/set-password").put(setPassword);

export default router;
