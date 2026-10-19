import { Router } from 'express';
import {
  listAllCampaigns,
  listAllWorkspaces,
  listUsers,
} from '../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const adminRouter = Router();

adminRouter.get('/users', authenticate, authorizeRoles('admin'), listUsers);
adminRouter.get(
  '/workspaces',
  authenticate,
  authorizeRoles('admin'),
  listAllWorkspaces
);
adminRouter.get(
  '/campaigns',
  authenticate,
  authorizeRoles('admin'),
  listAllCampaigns
);

export { adminRouter };
