import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string({ error: 'Name is required' }).trim(),
  email: z.email({ message: 'A valid email is required' }).trim(),
  password: z
    .string({ error: 'Password must be at least 8 characters' })
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export const loginSchema = z.object({
  email: z.email({ message: 'A valid email is required' }).trim(),
  password: z.string({ error: 'Password is required' }),
});
