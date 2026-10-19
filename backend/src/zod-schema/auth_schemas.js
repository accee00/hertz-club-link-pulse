import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({ error: 'Name must be between 2 and 80 characters' })
    .trim()
    .min(2, { message: 'Name must be between 2 and 80 characters' })
    .max(80, { message: 'Name must be between 2 and 80 characters' }),
  email: z
    .string({ error: 'A valid email address is required' }).email({ message: 'A valid email address is required' })
    .trim()
   ,
  password: z
    .string({ error: 'Password must be at least 8 characters' })
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email and password are required' })
    .trim()
    .min(1, { message: 'Email and password are required' }),
  password: z
    .string({ error: 'Email and password are required' })
    .min(1, { message: 'Email and password are required' }),
});
