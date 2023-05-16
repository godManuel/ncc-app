const express = require("express");
const { googleAuth } = require("../controllers/google-auth");
const router = express.Router();

router.route("/").post(googleAuth);

module.exports = router;
