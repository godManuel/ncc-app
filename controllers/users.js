import { User } from "../models/User.js";
import asyncHandler from "../middleware/async.js";
import ErrorResponse from "../utils/errorResponse.js";

// @DESC    Get user profile
// ROUTE    /api/users/me
// @ACCESS  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorResponse("User not found", 404));

  res.status(200).json({ success: true, data: user });
});

// @DESC    Edit user profile
// ROUTE    /api/users/me
// @ACCESS  Private
const updateEmail = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user.id).select("+password");
  if (!user) return next(new ErrorResponse("User not found", 404));

  const { oldEmail, newEmail, password } = req.body;

  if (oldEmail !== user.email)
    return next(new ErrorResponse("Email does not match! Try again", 400));

  if (newEmail === user.email)
    return next(new ErrorResponse("Email already added! Provide another"));

  if (!(await user.matchPassword(password)))
    return next(new ErrorResponse("Incorrect password! Try again", 400));

  user.email = req.body.newEmail;
  await user.save();

  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
    },
  });
});

// @DESC    Update user's password
// ROUTE    /api/users/profile/update-password
// @ACCESS  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!user) return next(new ErrorResponse("User not found", 404));

  const { oldPassword, newPassword } = req.body;

  if (!(await user.matchPassword(oldPassword)))
    return next(new ErrorResponse("Incorrect password! Try again", 400));

  if (await user.matchPassword(newPassword))
    return next(new ErrorResponse("Password already used! Provide another"));

  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({ user });
});

// @DESC    Update user's phone number
// ROUTE    /api/users/profile/update-phone-number
// @ACCESS  Private
const updatePhoneNumber = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ErrorResponse("User not found", 404));

  if (!user.mobile)
    return next(new ErrorResponse("No phone number added!", 404));

  const { oldPhone, newPhone } = req.body;

  if (oldPhone !== user.mobile)
    return next(
      new ErrorResponse("Phone number does not match! Try again", 400)
    );

  if (newPhone === user.mobile)
    return next(
      new ErrorResponse("Phone number already added! Provide another")
    );

  const phoneOTP = await user.getPhoneOTP();
  await user.save();

  const message = `${phoneOTP} is your verification code from NCC App \n\n `;

  try {
    await sendOTP({
      phone: req.body.newPhone,
      body: message,
    });

    res.status(200).json({
      success: true,
      data: {
        mobile: user.mobile,
        verified: user.isVerified,
        message: `OTP sent to ${req.body.newPhone}`,
      },
    });
  } catch (error) {
    console.log(error);
    user.phoneOTP = undefined;
    user.phoneOTPExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("OTP could not be sent", 500));
  }
});

export { getMe, updateEmail, updatePassword, updatePhoneNumber };
