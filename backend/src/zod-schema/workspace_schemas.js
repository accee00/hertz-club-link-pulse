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
