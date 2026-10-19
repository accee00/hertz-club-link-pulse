import { BlockedDomain } from '../models/blocked_domain.model.js';
import { ApiError } from './api_error.js';

const extractHostname = (url) => {
  try {
    const parsed = new URL(url);
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }
    return hostname;
  } catch {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid destination URL format',
    });
  }
};

const isDomainBlocked = async (destinationUrl) => {
  const hostname = extractHostname(destinationUrl);
  const blocked = await BlockedDomain.exists({ domain: hostname });
  return Boolean(blocked);
};

export { extractHostname, isDomainBlocked };
