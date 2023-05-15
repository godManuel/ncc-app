const express = require("express");
const { googleAuth } = require("../controllers/googleAuth");
const router = express.Router();

router.route("/").post(googleAuth);

module.exports = router;
