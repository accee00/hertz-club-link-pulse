import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { User } from '../models/user.model.js';
import { Workspace } from '../models/workspace.model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_reponse.js';

const createToken = (userId) => {
  return jwt.sign({ sub: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (
      typeof name !== 'string' ||
      name.trim().length < 2 ||
      name.trim().length > 80
    ) {
      throw new ApiError({
        statusCode: 400,
        message: 'Name must be between 2 and 80 characters',
      });
    }
    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      throw new ApiError({
        statusCode: 400,
        message: 'A valid email address is required',
      });
    }
    if (typeof password !== 'string' || password.length < 8) {
      throw new ApiError({
        statusCode: 400,
        message: 'Password must be at least 8 characters',
      });
    }

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

    const defaultWorkspace = await Workspace.create({
      name: `${user.name}'s Workspace`,
      owner: user._id,
    });

    const token = createToken(user.id);

    return res.status(201).json(
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
          workspace: {
            id: defaultWorkspace.id,
            name: defaultWorkspace.name,
          },
          token,
        },
      })
    );
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new ApiError({
        statusCode: 400,
        message: 'Email and password are required',
      });
    }

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
    return res.status(200).json(
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
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = (req, res) =>
  res.status(200).json(
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
