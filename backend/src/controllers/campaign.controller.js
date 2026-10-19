import mongoose from 'mongoose';
import { Campaign } from '../models/campaign.model.js';
import { Link } from '../models/link.model.js';
import { Workspace } from '../models/workspace.model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_reponse.js';
import { asyncHandler } from '../utils/async_handler.js';
import { aggregateClickAnalytics } from '../utils/analytics_helper.js';
import { sendResponse } from '../utils/send_reponse.js';

const createCampaign = asyncHandler(async (req, res) => {
  const { name, workspaceId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
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
    name,
    workspace: workspace._id,
  });

  return sendResponse(
    res,
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
});

const listCampaigns = asyncHandler(async (req, res) => {
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

  return sendResponse(
    res,
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
});

const getCampaignById = asyncHandler(async (req, res) => {
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

  return sendResponse(
    res,
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
});

const updateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

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

  campaign.name = name;
  await campaign.save();

  return sendResponse(
    res,
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
});

const deleteCampaign = asyncHandler(async (req, res) => {
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

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Campaign deleted successfully',
    })
  );
});

const getCampaignAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { period = '7d' } = req.query;

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
      message: 'Insufficient permissions for this campaign',
    });
  }

  const links = await Link.find({ campaign: campaign._id })
    .select('_id shortCode destinationUrl totalClicks status')
    .sort({ totalClicks: -1 });

  const linkIds = links.map((l) => l._id);

  const analytics = await aggregateClickAnalytics({
    linkIds,
    period,
  });

  const topLinks = links.slice(0, 5).map((l) => ({
    id: l.id,
    shortCode: l.shortCode,
    destinationUrl: l.destinationUrl,
    totalClicks: l.totalClicks,
    status: l.status,
  }));

  const totalClicksLifetime = links.reduce(
    (sum, l) => sum + (l.totalClicks || 0),
    0
  );

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Campaign analytics retrieved',
      data: {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          totalLinks: links.length,
          totalClicksLifetime,
        },
        ...analytics,
        topLinks,
      },
    })
  );
});

export {
  createCampaign,
  deleteCampaign,
  getCampaignAnalytics,
  getCampaignById,
  listCampaigns,
  updateCampaign,
};
