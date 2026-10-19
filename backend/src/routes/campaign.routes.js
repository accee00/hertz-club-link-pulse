import { Router } from 'express';
import {
  createCampaign,
  deleteCampaign,
  getCampaignAnalytics,
  getCampaignById,
  listCampaigns,
  updateCampaign,
} from '../controllers/campaign.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation_middleware.js';
import {
  createCampaignSchema,
  updateCampaignSchema,
} from '../zod-schema/campaign_schemas.js';

const campaignRouter = Router();

campaignRouter.use(authenticate);

campaignRouter
  .route('/')
  .post(validateBody(createCampaignSchema), createCampaign)
  .get(listCampaigns);

campaignRouter.route('/:id/analytics').get(getCampaignAnalytics);

campaignRouter
  .route('/:id')
  .get(getCampaignById)
  .patch(validateBody(updateCampaignSchema), updateCampaign)
  .delete(deleteCampaign);

export { campaignRouter };
