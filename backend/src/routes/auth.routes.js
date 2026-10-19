import { Router } from 'express';
import {
  getCurrentUser,
  login,
  register,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation_middleware.js';
import { loginSchema, registerSchema } from '../zod-schema/auth_schemas.js';

const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.get('/me', authenticate, getCurrentUser);

export { authRouter };
