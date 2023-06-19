import express from "express";
const router = express.Router();

import { updatePassword, updateEmail, getMe } from "../controllers/users.js";
import { protect } from "../middleware/auth-token.js";

router.route("/profile").get(protect, getMe);
router.route("/profile/update-email").put(protect, updateEmail);
router.route("/profile/update-password").put(protect, updatePassword);

export default router;
