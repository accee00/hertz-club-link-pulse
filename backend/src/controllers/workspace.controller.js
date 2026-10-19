import mongoose from 'mongoose';
import { Workspace } from '../models/workspace.model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_reponse.js';
import { asyncHandler } from '../utils/async_handler.js';
import { sendResponse } from '../utils/send_reponse.js';

const createWorkspace = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const workspace = await Workspace.create({
    name,
    owner: req.user._id,
  });

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 201,
      message: 'Workspace created successfully',
      data: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          owner: workspace.owner,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
      },
    })
  );
});

const listWorkspaces = asyncHandler(async (req, res) => {
  let workspaces = await Workspace.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });

  if (workspaces.length === 0) {
    const defaultWorkspace = await Workspace.create({
      name: `${req.user.name}'s Workspace`,
      owner: req.user._id,
    });
    workspaces = [defaultWorkspace];
  }

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Workspaces retrieved',
      data: {
        workspaces: workspaces.map((w) => ({
          id: w.id,
          name: w.name,
          owner: w.owner,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        })),
      },
    })
  );
});

const getWorkspaceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid workspace ID',
    });
  }

  const workspace = await Workspace.findById(id);
  if (!workspace) {
    throw new ApiError({
      statusCode: 404,
      message: 'Workspace not found',
    });
  }

  const isOwner = workspace.owner.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError({
      statusCode: 403,
      message: 'Insufficient permissions',
    });
  }

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Workspace retrieved',
      data: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          owner: workspace.owner,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
      },
    })
  );
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid workspace ID',
    });
  }

  const workspace = await Workspace.findById(id);
  if (!workspace) {
    throw new ApiError({
      statusCode: 404,
      message: 'Workspace not found',
    });
  }

  const isOwner = workspace.owner.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError({
      statusCode: 403,
      message: 'Insufficient permissions',
    });
  }

  workspace.name = name;
  await workspace.save();

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Workspace updated successfully',
      data: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          owner: workspace.owner,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
      },
    })
  );
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid workspace ID',
    });
  }

  const workspace = await Workspace.findById(id);
  if (!workspace) {
    throw new ApiError({
      statusCode: 404,
      message: 'Workspace not found',
    });
  }

  const isOwner = workspace.owner.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError({
      statusCode: 403,
      message: 'Insufficient permissions',
    });
  }

  const totalWorkspaces = await Workspace.countDocuments({
    owner: workspace.owner,
  });

  if (totalWorkspaces <= 1) {
    throw new ApiError({
      statusCode: 400,
      message: 'Cannot delete your only workspace',
    });
  }

  await workspace.deleteOne();

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Workspace deleted successfully',
    })
  );
});

export {
  createWorkspace,
  deleteWorkspace,
  getWorkspaceById,
  listWorkspaces,
  updateWorkspace,
};
