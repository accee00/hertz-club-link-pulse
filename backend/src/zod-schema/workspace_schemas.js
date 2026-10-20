import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string({ error: 'Workspace name is required' })
    .trim()
    .min(2, { message: 'Workspace name must be between 2 characters' }),
});

export const updateWorkspaceSchema = z.object({
  name: z
    .string({ error: 'Workspace name is required' })
    .trim()
    .min(2, { message: 'Workspace name must be between 2 characters' }),
});

export const createAdminWorkspaceSchema = z.object({
  name: z
    .string({ error: 'Workspace name is required' })
    .trim()
    .min(2, { message: 'Workspace name must be between 2 characters' })
    .max(80, { message: 'Workspace name cannot exceed 80 characters' }),
  ownerId: z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: 'A valid workspace owner is required',
  }),
});
