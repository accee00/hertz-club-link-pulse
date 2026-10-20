import express from 'express';
import { Router } from 'express';
import {
  createLink,
  deleteLink,
  getLinkAnalytics,
  getLinkById,
  getLinkQrCode,
  importLinks,
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

linkRouter.post(
  '/import',
  express.text({ type: 'text/csv', limit: '2mb' }),
  importLinks
);

linkRouter
  .route('/')
  .post(validateBody(createLinkSchema), createLink)
  .get(listLinks);

linkRouter.route('/:id/qr').get(getLinkQrCode);
linkRouter.route('/:id/analytics').get(getLinkAnalytics);

linkRouter
  .route('/:id')
  .get(getLinkById)
  .patch(validateBody(updateLinkSchema), updateLink)
  .delete(deleteLink);

export { linkRouter };
