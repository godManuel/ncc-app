import express from "express";
const router = express.Router();
import { googleAuth } from "../controllers/google-auth.js";

router.route("/").post(googleAuth);

export default router;
