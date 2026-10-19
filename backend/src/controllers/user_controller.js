import { asyncHandler } from '../utils/async_handler.js';
import { User } from '../models/user_model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_reponse.js';
import { sendError, sendResponse } from '../utils/send_reponse.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
};

const generateTokens = (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  return { accessToken, refreshToken };
};

const signUp = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = email.toLowerCase().trim();

  const isUserPresent = await User.findOne({ email: normalizedEmail });
  if (isUserPresent) {
    return sendError(
      res,
      new ApiError({ statusCode: 400, message: 'User already exists' })
    );
  }

  const user = await User.create({
    email: normalizedEmail,
    password,
  });

  if (!user) {
    return sendError(
      res,
      new ApiError({ statusCode: 500, message: 'Failed to create user' })
    );
  }

  const { accessToken, refreshToken } = generateTokens(user);

  const createdUser = user.toObject();
  delete createdUser.password;

  res
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions);

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 201,
      message: 'User created successfully',
      data: { createdUser, accessToken, refreshToken },
    })
  );
});

export { signUp };
