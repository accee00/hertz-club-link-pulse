import { Router } from 'express';
import {
  createCampaign,
  deleteCampaign,
  getCampaignById,
  listCampaigns,
  updateCampaign,
} from '../controllers/campaign.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const campaignRouter = Router();

campaignRouter.use(authenticate);

campaignRouter.route('/').post(createCampaign).get(listCampaigns);

campaignRouter
  .route('/:id')
  .get(getCampaignById)
  .patch(updateCampaign)
  .delete(deleteCampaign);

export { campaignRouter };
