import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/api_error.js';

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.get('authorization');
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) {
      throw new ApiError({
        statusCode: 401,
        message: 'Authentication required',
      });
    }

    const payload = jwt.verify(token, config.JWT_SECRET);
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      throw new ApiError({ statusCode: 401, message: 'Invalid token' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new ApiError({ statusCode: 401, message: 'Invalid token' });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return next(
        new ApiError({ statusCode: 401, message: 'Invalid or expired token' })
      );
    }

    return next(error);
  }
};

const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError({ statusCode: 401, message: 'Authentication required' })
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError({ statusCode: 403, message: 'Insufficient permissions' })
      );
    }

    return next();
  };

export { authenticate, authorizeRoles };
