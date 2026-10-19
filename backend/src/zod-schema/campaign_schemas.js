import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z
    .string({ error: 'Campaign name is required' })
    .trim()
    .min(2, { message: 'Campaign name must be at least 2 characters' }),
  workspaceId: z.string({ error: 'A valid workspaceId is required' }),
});

export const updateCampaignSchema = z.object({
  name: z
    .string({ error: 'Campaign name must be at least 2 characters' })
    .trim()
    .min(2, { message: 'Campaign name must be at least 2 characters' }),
});
