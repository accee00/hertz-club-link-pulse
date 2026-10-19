import { z } from 'zod';

export const createLinkSchema = z.object({
  workspaceId: z.string({ error: 'A valid workspaceId is required' }),
  campaignId: z.string().optional().nullable(),
  destinationUrl: z.url({ message: 'A valid URL is required' }).trim(),
  customAlias: z
    .string()
    .trim()
    .min(3, { message: 'Custom alias must be at least 3 characters' })
    .max(30, { message: 'Custom alias must not exceed 30 characters' })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        'Custom alias can only contain letters, numbers, hyphens, and underscores',
    })
    .optional()
    .nullable(),
  tags: z.array(z.string().trim().toLowerCase()).optional(),
  expiresAt: z.iso
    .datetime({ message: 'Invalid datetime format for expiresAt' })
    .optional()
    .nullable(),
  clickLimit: z
    .number()
    .int()
    .positive({ message: 'Click limit must be a positive integer' })
    .optional()
    .nullable(),
  password: z
    .string()
    .min(4, { message: 'Password must be at least 4 characters' })
    .optional()
    .nullable(),
});

export const updateLinkSchema = z.object({
  destinationUrl: z
    .url({ message: 'A valid URL is required' })
    .trim()
    .optional(),
  campaignId: z.string().optional().nullable(),
  tags: z.array(z.string().trim().toLowerCase()).optional(),
  status: z.enum(['active', 'disabled']).optional(),
  expiresAt: z.iso.datetime().optional().nullable(),
  clickLimit: z.number().int().positive().optional().nullable(),
  password: z
    .string()
    .min(4, { message: 'Password must be at least 4 characters' })
    .optional()
    .nullable(),
});

export const verifyPasswordSchema = z.object({
  password: z
    .string({ error: 'Password is required' })
    .min(1, { message: 'Password cannot be empty' }),
});
