import { Router } from 'express';
import {
  createLink,
  deleteLink,
  getLinkById,
  getLinkQrCode,
  listLinks,
  updateLink,
} from '../controllers/link.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation_middleware.js';
import {
  createLinkSchema,
  updateLinkSchema,
} from '../zod-schema/link_schemas.js';

const linkRouter = Router();

linkRouter.use(authenticate);

linkRouter
  .route('/')
  .post(validateBody(createLinkSchema), createLink)
  .get(listLinks);

linkRouter.route('/:id/qr').get(getLinkQrCode);

linkRouter
  .route('/:id')
  .get(getLinkById)
  .patch(validateBody(updateLinkSchema), updateLink)
  .delete(deleteLink);

export { linkRouter };
