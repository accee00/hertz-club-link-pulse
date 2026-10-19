import { Router } from 'express';
import { listUsers } from '../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const adminRouter = Router();

adminRouter.get('/users', authenticate, authorizeRoles('admin'), listUsers);

export { adminRouter };
