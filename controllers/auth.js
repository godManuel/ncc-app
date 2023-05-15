const { User } = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @DESC        Register user
// @ROUTE       POST  /api/auth/register
// @ACCESS      Public
exports.register = asyncHandler(async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });

  user = await User.create(req.body);

  const token = user.getSignedToken();

  res.status(200).json({
    success: true,
    data: {
      email: user.email,
      verified: user.isVerified,
      message: "Good! Account registered!",
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
      verified: user.isVerified,
      message: "Good! Proceed to OTP verification",
    },
  });
});

// @DESC        Forgot password
// @ROUTE       POST  /api/auth/forgot-password
// @ACCESS      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new ErrorResponse("No account with the given email", 404));

  const passwordOTP = await user.getOTP();
  await user.save();

  const message = `Please validate your email account in order to recover your password \n\n ${passwordOTP}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password OTP",
      message,
    });

    res.status(200).json({
      success: true,
      data: {
        email: user.email,
        verified: user.isVerified,
        message:
          "Good! An OTP for password recovery has been sent to your mail",
      },
    });
  } catch (error) {
    console.log(error);
    user.otpToken = undefined;
    user.otpExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @DESC        Reset password
// @ROUTE       POST  /api/auth/reset-password/:resetToken
// @ACCESS      Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ErrorResponse("User not found", 404));

  if (user.otpToken) return next(new ErrorResponse("OTP not verified yet!"));

  // Change user password
  user.password = req.body.password;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      email: user.email,
      verified: user.isVerified,
      message: "Good! Your password has been recovered",
    },
  });
});

// @DESC        Get user OTP
// @ROUTE       POST  /api/auth/get-user-otp
// @ACCESS      Public
exports.getOTP = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new ErrorResponse("No account with the given email", 404));

  const newOTP = await user.getOTP();
  await user.save();

  const message = `Please validate your email account \n\n ${newOTP}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "OTP Verification",
      message,
    });

    res.status(200).json({
      success: true,
      data: {
        email: user.email,
        verified: user.isVerified,
        message: "Good! An OTP has been sent to your mail",
      },
    });
  } catch (error) {
    console.log(error);
    user.otpToken = undefined;
    user.otpExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @DESC        Verify user OTP
// @ROUTE       POST  /api/auth/verify-user-otp
// @ACCESS      Public
exports.verifyOTP = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ErrorResponse("User not found", 404));

  const verifiedOTP = await user.verifyOTP(req.body.OTP);
  if (!verifiedOTP) return next(new ErrorResponse("Invalid OTP"));

  if (user.OTPExpire < Date.now()) {
    return next(new ErrorResponse("OTP Expired! Request a new one", 400));
  }

  user.isVerified = true;
  user.otpExpire = undefined;
  user.otpToken = undefined;

  await user.save();

  const token = user.getSignedToken();

  res.status(200).json({
    success: true,
    data: {
      email: user.email,
      verified: user.isVerified,
      token,
    },
  });
});
