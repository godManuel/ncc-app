const { User } = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @DESC        Register user
// @ROUTE       POST  /api/auth/register
// @ACCESS      Public
exports.register = asyncHandler(async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  // if (user) return next(new ErrorResponse("User already exists!", 400));

  user = await User.create(req.body);

  const token = user.getSignedToken();

  res.status(200).json({
    success: true,
    data: {
      email: user.email,
      token,
    },
  });
});

// @DESC        Login user
// @ROUTE       POST  /api/auth/login
// @ACCESS      Public
exports.login = asyncHandler(async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(new ErrorResponse("Please enter an email and password", 400));
  }

  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );
  if (!user) return next(new ErrorResponse("Credentials invalid", 401));

  const isMatch = await user.matchPassword(req.body.password);
  if (!isMatch) return next(new ErrorResponse("Credentials invalid", 401));

  const token = user.getSignedToken();

  res.status(200).json({
    success: true,
    data: {
      email: user.email,
      token,
    },
  });
});
