import { z } from 'zod';

export const createBlockedDomainSchema = z.object({
  domain: z.string({ error: 'Domain is required' }).trim().toLowerCase(),
});
