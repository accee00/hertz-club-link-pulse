import mongoose from 'mongoose';
import { BlockedDomain } from '../models/blocked_domain.model.js';
import { Campaign } from '../models/campaign.model.js';
import { Link } from '../models/link.model.js';
import { User } from '../models/user.model.js';
import { Workspace } from '../models/workspace.model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_reponse.js';
import { asyncHandler } from '../utils/async_handler.js';
import { sendResponse } from '../utils/send_reponse.js';

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .sort({ createdAt: -1 })
    .select('name email role createdAt');

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Users retrieved',
      data: {
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        })),
      },
    })
  );
});

const listAllWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find()
    .sort({ createdAt: -1 })
    .populate('owner', 'name email role');

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'All workspaces retrieved',
      data: {
        workspaces: workspaces.map((w) => ({
          id: w.id,
          name: w.name,
          owner: w.owner
            ? {
                id: w.owner._id ?? w.owner.id,
                name: w.owner.name,
                email: w.owner.email,
                role: w.owner.role,
              }
            : null,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        })),
      },
    })
  );
});

const listAllCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find()
    .sort({ createdAt: -1 })
    .populate({
      path: 'workspace',
      select: 'name owner',
      populate: {
        path: 'owner',
        select: 'name email role',
      },
    });

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'All campaigns retrieved',
      data: {
        campaigns: campaigns.map((c) => ({
          id: c.id,
          name: c.name,
          workspace: c.workspace
            ? {
                id: c.workspace._id ?? c.workspace.id,
                name: c.workspace.name,
                owner: c.workspace.owner
                  ? {
                      id: c.workspace.owner._id ?? c.workspace.owner.id,
                      name: c.workspace.owner.name,
                      email: c.workspace.owner.email,
                      role: c.workspace.owner.role,
                    }
                  : null,
              }
            : null,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      },
    })
  );
});

const listAllLinks = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status && ['active', 'disabled'].includes(status)) {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { shortCode: { $regex: search, $options: 'i' } },
      { destinationUrl: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, links] = await Promise.all([
    Link.countDocuments(filter),
    Link.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: 'workspace',
        select: 'name owner',
        populate: {
          path: 'owner',
          select: 'name email role',
        },
      })
      .populate('campaign', 'name'),
  ]);

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'All links retrieved',
      data: {
        links: links.map((link) => ({
          id: link.id,
          shortCode: link.shortCode,
          destinationUrl: link.destinationUrl,
          status: link.status,
          totalClicks: link.totalClicks,
          tags: link.tags,
          expiresAt: link.expiresAt,
          clickLimit: link.clickLimit,
          isPasswordProtected: Boolean(link.passwordHash),
          workspace: link.workspace
            ? {
                id: link.workspace._id ?? link.workspace.id,
                name: link.workspace.name,
                owner: link.workspace.owner
                  ? {
                      id: link.workspace.owner._id ?? link.workspace.owner.id,
                      name: link.workspace.owner.name,
                      email: link.workspace.owner.email,
                    }
                  : null,
              }
            : null,
          campaign: link.campaign
            ? {
                id: link.campaign._id ?? link.campaign.id,
                name: link.campaign.name,
              }
            : null,
          createdAt: link.createdAt,
          updatedAt: link.updatedAt,
        })),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    })
  );
});

const updateLinkStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid link ID',
    });
  }

  if (!status || !['active', 'disabled'].includes(status)) {
    throw new ApiError({
      statusCode: 400,
      message: "Status must be either 'active' or 'disabled'",
    });
  }

  const link = await Link.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true }
  );

  if (!link) {
    throw new ApiError({
      statusCode: 404,
      message: 'Link not found',
    });
  }

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: `Link status updated to ${status}`,
      data: {
        id: link.id,
        shortCode: link.shortCode,
        status: link.status,
      },
    })
  );
});

const createBlockedDomain = asyncHandler(async (req, res) => {
  const { domain } = req.body;

  let cleanDomain = domain.toLowerCase().trim();
  try {
    if (cleanDomain.includes('://')) {
      cleanDomain = new URL(cleanDomain).hostname;
    } else if (cleanDomain.includes('/')) {
      cleanDomain = cleanDomain.split('/')[0];
    }
  } catch {}

  const existing = await BlockedDomain.findOne({ domain: cleanDomain });
  if (existing) {
    throw new ApiError({
      statusCode: 409,
      message: 'Domain is already blocked',
    });
  }

  const blocked = await BlockedDomain.create({ domain: cleanDomain });

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 201,
      message: 'Domain blocked successfully',
      data: {
        blockedDomain: {
          id: blocked.id,
          domain: blocked.domain,
          createdAt: blocked.createdAt,
        },
      },
    })
  );
});

const listBlockedDomains = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (search) {
    filter.domain = { $regex: search, $options: 'i' };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const [total, domains] = await Promise.all([
    BlockedDomain.countDocuments(filter),
    BlockedDomain.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
  ]);

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Blocked domains retrieved',
      data: {
        blockedDomains: domains.map((d) => ({
          id: d.id,
          domain: d.domain,
          createdAt: d.createdAt,
        })),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    })
  );
});

const deleteBlockedDomain = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid blocked domain ID',
    });
  }

  const blocked = await BlockedDomain.findByIdAndDelete(id);
  if (!blocked) {
    throw new ApiError({
      statusCode: 404,
      message: 'Blocked domain not found',
    });
  }

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Domain removed from blocklist successfully',
    })
  );
});

const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalWorkspaces,
    totalCampaigns,
    totalLinks,
    activeLinks,
    disabledLinks,
    totalClicksResult,
    totalBlockedDomains,
    recentLinks,
  ] = await Promise.all([
    User.countDocuments(),
    Workspace.countDocuments(),
    Campaign.countDocuments(),
    Link.countDocuments(),
    Link.countDocuments({ status: 'active' }),
    Link.countDocuments({ status: 'disabled' }),
    Link.aggregate([
      {
        $group: {
          _id: null,
          totalClicks: { $sum: '$totalClicks' },
        },
      },
    ]),
    BlockedDomain.countDocuments(),
    Link.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('shortCode destinationUrl totalClicks createdAt')
      .populate('workspace', 'name'),
  ]);

  const totalClicksLifetime = totalClicksResult[0]?.totalClicks || 0;

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Platform analytics retrieved',
      data: {
        overview: {
          totalUsers,
          totalWorkspaces,
          totalCampaigns,
          totalLinks,
          activeLinks,
          disabledLinks,
          totalClicksLifetime,
          totalBlockedDomains,
        },
        recentLinks: recentLinks.map((l) => ({
          id: l.id,
          shortCode: l.shortCode,
          destinationUrl: l.destinationUrl,
          totalClicks: l.totalClicks,
          workspaceName: l.workspace?.name || null,
          createdAt: l.createdAt,
        })),
      },
    })
  );
});

export {
  createBlockedDomain,
  deleteBlockedDomain,
  getPlatformAnalytics,
  listAllCampaigns,
  listAllLinks,
  listAllWorkspaces,
  listBlockedDomains,
  listUsers,
  updateLinkStatus,
};
