import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z
    .string({ error: 'Campaign name must be between 2 and 80 characters' })
    .trim()
    .min(2, { message: 'Campaign name must be between 2 and 80 characters' })
    .max(80, { message: 'Campaign name must be between 2 and 80 characters' }),
  workspaceId: z.string({ error: 'A valid workspaceId is required' }),
});

export const updateCampaignSchema = z.object({
  name: z
    .string({ error: 'Campaign name must be between 2 and 80 characters' })
    .trim()
    .min(2, { message: 'Campaign name must be between 2 and 80 characters' })
    .max(80, { message: 'Campaign name must be between 2 and 80 characters' }),
});
