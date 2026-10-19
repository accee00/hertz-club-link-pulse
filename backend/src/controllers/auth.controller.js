import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { User } from '../models/user.model.js';
import { Workspace } from '../models/workspace.model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_reponse.js';
import { asyncHandler } from '../utils/async_handler.js';
import { sendResponse } from '../utils/send_reponse.js';

const createToken = (userId) => {
  return jwt.sign({ sub: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError({
      statusCode: 409,
      message: 'An account with this email already exists',
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  await Workspace.create({
    name: `${user.name}'s Workspace`,
    owner: user._id,
  });

  const token = createToken(user.id);

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 201,
      message: 'Account created',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    })
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select('+passwordHash');

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError({
      statusCode: 401,
      message: 'Invalid email or password',
    });
  }

  const token = createToken(user.id);

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    })
  );
});

const getCurrentUser = (req, res) =>
  sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Current user',
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      },
    })
  );

export { getCurrentUser, login, register };
