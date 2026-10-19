import { Router } from 'express';
import {
  getLinkPreview,
  handleRedirect,
  verifyLinkPassword,
} from '../controllers/redirect.controller.js';
import { validateBody } from '../middleware/validation_middleware.js';
import { verifyPasswordSchema } from '../zod-schema/link_schemas.js';

const redirectRouter = Router();

redirectRouter.route('/:shortCode/preview').get(getLinkPreview);
redirectRouter
  .route('/:shortCode/verify-password')
  .post(validateBody(verifyPasswordSchema), verifyLinkPassword);
redirectRouter.route('/:shortCode').get(handleRedirect);

export { redirectRouter };
