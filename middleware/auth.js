const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return next(
      new ErrorResponse(
        "Not authorize to access this route",
        StatusCodes.UNAUTHORIZED
      )
    );

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(
      new ErrorResponse(
        "Not authorize to access this route",
        StatusCodes.UNAUTHORIZED
      )
    );
  }
});

// Allow access to admin roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse("Not allowed to this resource", StatusCodes.FORBIDDEN)
      );
    }

    next();
  };
};
