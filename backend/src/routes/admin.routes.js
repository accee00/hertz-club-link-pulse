import { Router } from 'express';
import {
  createBlockedDomain,
  deleteBlockedDomain,
  getPlatformAnalytics,
  listAllCampaigns,
  listAllLinks,
  listAllWorkspaces,
  listBlockedDomains,
  listUsers,
  updateLinkStatus,
} from '../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation_middleware.js';
import { createBlockedDomainSchema } from '../zod-schema/blocked_domain_schemas.js';

const adminRouter = Router();

adminRouter.use(authenticate, authorizeRoles('admin'));

adminRouter.get('/users', listUsers);
adminRouter.get('/workspaces', listAllWorkspaces);
adminRouter.get('/campaigns', listAllCampaigns);

adminRouter.get('/links', listAllLinks);
adminRouter.patch('/links/:id/status', updateLinkStatus);

adminRouter
  .route('/blocked-domains')
  .post(validateBody(createBlockedDomainSchema), createBlockedDomain)
  .get(listBlockedDomains);

adminRouter.delete('/blocked-domains/:id', deleteBlockedDomain);

adminRouter.get('/analytics', getPlatformAnalytics);

export { adminRouter };
