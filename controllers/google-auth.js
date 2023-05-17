const asyncHandler = require("../middleware/async");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

exports.googleAuth = asyncHandler(async (req, res, next) => {
  // Instantiate a googleClient 'object' from the OAuth2Client 'class'
  const googleClient = new OAuth2Client({
    clientId: `${process.env.GOOGLE_CLIENT_ID}`,
  });

  // Verify if google user
  let { token } = req.body;

  // Get ticket from verified token with google-client-id
  const ticket = await googleClient.verifyIdToken({
    audience: process.env.GOOGLE_CLIENT_ID,
    idToken: token,
  });

  // Get payload from
  const payload = ticket.getPayload();

  // Check if google user exists in User model
  let user = await User.findOne({ email: payload.email });

  // Truthy -> Sign a new JWT with the google user payload
  if (user) {
    const userToken = jwt.sign(
      {
        email: payload.email,
        name: payload.name,
        avatar: payload.avatar,
        provider: payload.provider,
      },
      process.env.JWT_KEY
    );

    return res.status(200).json({ success: true, data: userToken });
  }
  // Falsy -> Create a new user, store in database & create a new JWT

  user = await User.create({
    email: payload.email,
    avatar: payload.picture,
    name: payload.name,
  });

  await user.save();

  const userToken = jwt.sign(
    {
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
    process.env.JWT_KEY
  );

  res.status(201).json({ success: true, data: userToken });
});
