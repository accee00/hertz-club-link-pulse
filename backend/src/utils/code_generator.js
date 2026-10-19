import { customAlphabet } from 'nanoid';
import { ApiError } from './api_error.js';

const ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SHORT_CODE_LENGTH = 7;

const nanoid = customAlphabet(ALPHABET, SHORT_CODE_LENGTH);

const RESERVED_ALIASES = new Set([
  'admin',
  'api',
  'auth',
  'dashboard',
  'health',
  'login',
  'logout',
  'r',
  'register',
  'status',
  'workspaces',
  'campaigns',
  'links',
  'settings',
]);

const generateShortCode = () => nanoid();

const isReservedAlias = (alias) => {
  if (typeof alias !== 'string') return false;
  return RESERVED_ALIASES.has(alias.trim().toLowerCase());
};

const generateUniqueShortCode = async (LinkModel, maxAttempts = 5) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateShortCode();
    const existing = await LinkModel.exists({ shortCode: candidate });
    if (!existing) {
      return candidate;
    }
  }

  throw new ApiError({
    statusCode: 500,
    message: 'Unable to generate uniquwe short code.',
  });
};

export { generateShortCode, generateUniqueShortCode, isReservedAlias };
