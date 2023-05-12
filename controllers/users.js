const { User } = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.user.email });
  if (!user) return next(new ErrorResponse("User not found", 404));

  console.log(req.user);

  res.status(200).json({ success: true, data: user });
});
