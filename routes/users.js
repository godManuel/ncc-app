import express from "express";
const router = express.Router();

import {
  updatePassword,
  updateEmail,
  getMe,
  updatePhoneNumber,
} from "../controllers/users.js";
import { protect } from "../middleware/auth-token.js";

router.route("/profile").get(protect, getMe);
router.route("/profile/update-email").put(protect, updateEmail);
router.route("/profile/update-password").put(protect, updatePassword);
router.route("/profile/update-phone-number").put(protect, updatePhoneNumber);

export default router;
