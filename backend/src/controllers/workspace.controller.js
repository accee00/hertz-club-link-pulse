import mongoose from 'mongoose';
import { Workspace } from '../models/workspace.model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_reponse.js';

const validateWorkspaceName = (name) => {
  if (
    typeof name !== 'string' ||
    name.trim().length < 2 ||
    name.trim().length > 80
  ) {
    throw new ApiError({
      statusCode: 400,
      message: 'Workspace name must be between 2 and 80 characters',
    });
  }
  return name.trim();
};

const createWorkspace = async (req, res, next) => {
  try {
    const { name } = req.body ?? {};
    const validName = validateWorkspaceName(name);

    const workspace = await Workspace.create({
      name: validName,
      owner: req.user._id,
    });

    return res.status(201).json(
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
  } catch (error) {
    return next(error);
  }
};

const listWorkspaces = async (req, res, next) => {
  try {
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

    return res.status(200).json(
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
  } catch (error) {
    return next(error);
  }
};

const getWorkspaceById = async (req, res, next) => {
  try {
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

    return res.status(200).json(
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
  } catch (error) {
    return next(error);
  }
};

const updateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError({
        statusCode: 400,
        message: 'Invalid workspace ID',
      });
    }

    const { name } = req.body ?? {};
    const validName = validateWorkspaceName(name);

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

    workspace.name = validName;
    await workspace.save();

    return res.status(200).json(
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
  } catch (error) {
    return next(error);
  }
};

const deleteWorkspace = async (req, res, next) => {
  try {
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

    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: 'Workspace deleted successfully',
      })
    );
  } catch (error) {
    return next(error);
  }
};

export {
  createWorkspace,
  deleteWorkspace,
  getWorkspaceById,
  listWorkspaces,
  updateWorkspace,
};
