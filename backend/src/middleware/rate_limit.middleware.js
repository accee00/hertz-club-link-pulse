import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { ApiError } from '../utils/api_error.js';

const getClientIp = (req) =>
  req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.ip ||
  '127.0.0.1';

const defaultIpKeyGenerator = (req) => ipKeyGenerator(getClientIp(req));

const createRateLimiter = ({
  windowMs,
  limit,
  message,
  keyGenerator = defaultIpKeyGenerator,
  skipSuccessfulRequests = false,
}) => {
  const options = {
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: true,
    keyGenerator,
    skipSuccessfulRequests,
    handler: (req, res, next, opts) => {
      return next(
        new ApiError({
          statusCode: opts.statusCode || 429,
          message:
            typeof opts.message === 'string'
              ? opts.message
              : 'Too many requests, please try again later.',
        })
      );
    },
    message,
  };

  return rateLimit(options);
};

const userOrIpKeyGenerator = (req) => {
  if (req.user?._id) {
    return `user_${req.user._id}`;
  }
  return defaultIpKeyGenerator(req);
};

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message:
    'Too many requests to authentication endpoints. Please try again later.',
});

export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many login attempts. Please try again after 15 minutes.',
});

export const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message:
    'Too many accounts created from this IP. Please try again after an hour.',
});

export const linkCreationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  keyGenerator: userOrIpKeyGenerator,
  message: 'Too many links created. Please slow down and try again later.',
});

export const linkImportLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: userOrIpKeyGenerator,
  message:
    'Too many link import requests. Please slow down and try again later.',
});

export const verifyPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  message: 'Too many password attempts for this link. Please try again later.',
});
