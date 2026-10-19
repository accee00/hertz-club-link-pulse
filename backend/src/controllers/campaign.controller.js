import mongoose from 'mongoose';
import { Campaign } from '../models/campaign.model.js';
import { Workspace } from '../models/workspace.model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_reponse.js';

const validateCampaignName = (name) => {
  if (
    typeof name !== 'string' ||
    name.trim().length < 2 ||
    name.trim().length > 80
  ) {
    throw new ApiError({
      statusCode: 400,
      message: 'Campaign name must be between 2 and 80 characters',
    });
  }
  return name.trim();
};

const createCampaign = async (req, res, next) => {
  try {
    const { name, workspaceId } = req.body ?? {};
    const validName = validateCampaignName(name);

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      throw new ApiError({
        statusCode: 400,
        message: 'A valid workspaceId is required',
      });
    }

    const workspace = await Workspace.findById(workspaceId);
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
        message: 'Insufficient permissions for this workspace',
      });
    }

    const campaign = await Campaign.create({
      name: validName,
      workspace: workspace._id,
    });

    return res.status(201).json(
      new ApiResponse({
        statusCode: 201,
        message: 'Campaign created successfully',
        data: {
          campaign: {
            id: campaign.id,
            name: campaign.name,
            workspace: campaign.workspace,
            createdAt: campaign.createdAt,
            updatedAt: campaign.updatedAt,
          },
        },
      })
    );
  } catch (error) {
    return next(error);
  }
};

const listCampaigns = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;

    let filter = {};
    if (workspaceId) {
      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        throw new ApiError({
          statusCode: 400,
          message: 'Invalid workspaceId',
        });
      }

      const workspace = await Workspace.findById(workspaceId);
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
          message: 'Insufficient permissions for this workspace',
        });
      }

      filter.workspace = workspace._id;
    } else {
      const userWorkspaces = await Workspace.find({
        owner: req.user._id,
      }).select('_id');
      const workspaceIds = userWorkspaces.map((w) => w._id);
      filter.workspace = { $in: workspaceIds };
    }

    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .populate('workspace', 'name');

    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: 'Campaigns retrieved',
        data: {
          campaigns: campaigns.map((c) => ({
            id: c.id,
            name: c.name,
            workspace: c.workspace
              ? {
                  id: c.workspace._id ?? c.workspace.id,
                  name: c.workspace.name,
                }
              : c.workspace,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          })),
        },
      })
    );
  } catch (error) {
    return next(error);
  }
};

const getCampaignById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError({
        statusCode: 400,
        message: 'Invalid campaign ID',
      });
    }

    const campaign = await Campaign.findById(id).populate({
      path: 'workspace',
      select: 'name owner',
    });

    if (!campaign) {
      throw new ApiError({
        statusCode: 404,
        message: 'Campaign not found',
      });
    }

    const isOwner = campaign.workspace?.owner?.equals(req.user._id);
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
        message: 'Campaign retrieved',
        data: {
          campaign: {
            id: campaign.id,
            name: campaign.name,
            workspace: campaign.workspace
              ? {
                  id: campaign.workspace._id ?? campaign.workspace.id,
                  name: campaign.workspace.name,
                }
              : null,
            createdAt: campaign.createdAt,
            updatedAt: campaign.updatedAt,
          },
        },
      })
    );
  } catch (error) {
    return next(error);
  }
};

const updateCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError({
        statusCode: 400,
        message: 'Invalid campaign ID',
      });
    }

    const { name } = req.body ?? {};
    const validName = validateCampaignName(name);

    const campaign = await Campaign.findById(id).populate({
      path: 'workspace',
      select: 'name owner',
    });

    if (!campaign) {
      throw new ApiError({
        statusCode: 404,
        message: 'Campaign not found',
      });
    }

    const isOwner = campaign.workspace?.owner?.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new ApiError({
        statusCode: 403,
        message: 'Insufficient permissions',
      });
    }

    campaign.name = validName;
    await campaign.save();

    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: 'Campaign updated successfully',
        data: {
          campaign: {
            id: campaign.id,
            name: campaign.name,
            workspace: campaign.workspace
              ? {
                  id: campaign.workspace._id ?? campaign.workspace.id,
                  name: campaign.workspace.name,
                }
              : null,
            createdAt: campaign.createdAt,
            updatedAt: campaign.updatedAt,
          },
        },
      })
    );
  } catch (error) {
    return next(error);
  }
};

const deleteCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError({
        statusCode: 400,
        message: 'Invalid campaign ID',
      });
    }

    const campaign = await Campaign.findById(id).populate({
      path: 'workspace',
      select: 'name owner',
    });

    if (!campaign) {
      throw new ApiError({
        statusCode: 404,
        message: 'Campaign not found',
      });
    }

    const isOwner = campaign.workspace?.owner?.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new ApiError({
        statusCode: 403,
        message: 'Insufficient permissions',
      });
    }

    if (mongoose.models.Link) {
      await mongoose.models.Link.updateMany(
        { campaign: campaign._id },
        { $set: { campaign: null } }
      );
    }

    await campaign.deleteOne();

    return res.status(200).json(
      new ApiResponse({
        statusCode: 200,
        message: 'Campaign deleted successfully',
      })
    );
  } catch (error) {
    return next(error);
  }
};

export {
  createCampaign,
  deleteCampaign,
  getCampaignById,
  listCampaigns,
  updateCampaign,
};
