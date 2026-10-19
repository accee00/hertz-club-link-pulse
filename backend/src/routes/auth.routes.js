import { Router } from 'express';
import {
  getCurrentUser,
  login,
  register,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', authenticate, getCurrentUser);

export { authRouter };
