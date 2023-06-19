import asyncHandler from "../middleware/async.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const googleAuth = asyncHandler(async (req, res, next) => {
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
        avatar: payload.picture,
        provider: payload.provider,
      },
      process.env.JWT_KEY
    );

    return res.status(200).json({ success: true, data: userToken });
  }
  // Falsy -> Create a new user, store in database & create a new JWT

  user = await User.create({
    email: payload.email,
    name: payload.name,
    avatar: payload.picture,
    provider: payload.provider,
  });

  await user.save();

  const userToken = jwt.sign(
    {
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
      provider: payload.provider,
    },
    process.env.JWT_KEY
  );

  res.status(201).json({ success: true, data: userToken });
});

export { googleAuth };
