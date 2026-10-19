import { z } from 'zod';

export const signUpUserSchema = z.object({
  email: z.email({ error: 'Invalid email address.' }),
  password: z
    .string({ error: 'Password is required.' })
    .min(6, { message: 'Password must be at least 6 characters long.' }),
});
