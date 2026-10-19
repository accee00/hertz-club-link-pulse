import { Router } from 'express';
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspaceById,
  listWorkspaces,
  updateWorkspace,
} from '../controllers/workspace.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const workspaceRouter = Router();

workspaceRouter.use(authenticate);

workspaceRouter.route('/').post(createWorkspace).get(listWorkspaces);

workspaceRouter
  .route('/:id')
  .get(getWorkspaceById)
  .patch(updateWorkspace)
  .delete(deleteWorkspace);

export { workspaceRouter };
