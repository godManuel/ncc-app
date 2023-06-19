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

export { getMe, updateEmail, updatePassword };
