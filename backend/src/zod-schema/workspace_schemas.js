import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string({ error: 'Workspace name must be between 2 and 80 characters' })
    .trim()
    .min(2, { message: 'Workspace name must be between 2 and 80 characters' })
    .max(80, { message: 'Workspace name must be between 2 and 80 characters' }),
});

export const updateWorkspaceSchema = z.object({
  name: z
    .string({ error: 'Workspace name must be between 2 and 80 characters' })
    .trim()
    .min(2, { message: 'Workspace name must be between 2 and 80 characters' })
    .max(80, { message: 'Workspace name must be between 2 and 80 characters' }),
});
