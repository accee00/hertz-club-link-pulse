import { Router } from 'express';
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspaceById,
  listWorkspaces,
  updateWorkspace,
} from '../controllers/workspace.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation_middleware.js';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
} from '../zod-schema/workspace_schemas.js';

const workspaceRouter = Router();

workspaceRouter.use(authenticate);

workspaceRouter
  .route('/')
  .post(validateBody(createWorkspaceSchema), createWorkspace)
  .get(listWorkspaces);

workspaceRouter
  .route('/:id')
  .get(getWorkspaceById)
  .patch(validateBody(updateWorkspaceSchema), updateWorkspace)
  .delete(deleteWorkspace);

export { workspaceRouter };
