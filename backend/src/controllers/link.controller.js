import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import qrcode from 'qrcode';
import { Campaign } from '../models/campaign.model.js';
import { ClickEvent } from '../models/click_event.model.js';
import { Link } from '../models/link.model.js';
import { Workspace } from '../models/workspace.model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_reponse.js';
import { asyncHandler } from '../utils/async_handler.js';
import {
  generateUniqueShortCode,
  isReservedAlias,
} from '../utils/code_generator.js';
import { isDomainBlocked } from '../utils/domain_helper.js';
import { aggregateClickAnalytics } from '../utils/analytics_helper.js';
import { sendResponse } from '../utils/send_reponse.js';

const serializeLink = (link, req) => {
  const host = req?.get('host') || 'localhost:3000';
  const protocol = req?.protocol || 'http';

  return {
    id: link.id,
    shortCode: link.shortCode,
    shortUrl: `${protocol}://${host}/r/${link.shortCode}`,
    destinationUrl: link.destinationUrl,
    workspace: link.workspace
      ? {
          id: link.workspace._id,
          name: link.workspace.name,
        }
      : null,
    campaign: link.campaign
      ? {
          id: link.campaign._id,
          name: link.campaign.name,
        }
      : null,
    tags: link.tags || [],
    status: link.status,
    expiresAt: link.expiresAt,
    clickLimit: link.clickLimit,
    isPasswordProtected: Boolean(link.passwordHash),
    totalClicks: link.totalClicks,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  };
};

const createLink = asyncHandler(async (req, res) => {
  const {
    workspaceId,
    campaignId,
    destinationUrl,
    customAlias,
    tags,
    expiresAt,
    clickLimit,
    password,
  } = req.body;

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

  if (campaignId) {
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      throw new ApiError({
        statusCode: 400,
        message: 'Invalid campaignId',
      });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign || !campaign.workspace.equals(workspace._id)) {
      throw new ApiError({
        statusCode: 400,
        message: 'Campaign does not belong to this workspace',
      });
    }
  }

  if (await isDomainBlocked(destinationUrl)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Destination domain is blocked due to safety policies',
    });
  }

  let shortCode;
  if (customAlias) {
    if (isReservedAlias(customAlias)) {
      throw new ApiError({
        statusCode: 400,
        message: 'This alias is reserved by the system',
      });
    }

    const existingLink = await Link.exists({ shortCode: customAlias });
    if (existingLink) {
      throw new ApiError({
        statusCode: 409,
        message: 'This custom alias is already taken',
      });
    }

    shortCode = customAlias;
  } else {
    shortCode = await generateUniqueShortCode(Link);
  }

  let passwordHash = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 12);
  }

  const link = await Link.create({
    workspace: workspace._id,
    campaign: campaignId || null,
    shortCode,
    destinationUrl,
    tags: tags || [],
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    clickLimit: clickLimit || null,
    passwordHash,
  });

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 201,
      message: 'Link created successfully',
      data: {
        link: serializeLink(link, req),
      },
    })
  );
});

const listLinks = asyncHandler(async (req, res) => {
  const { workspaceId, campaignId, tag, status, search } = req.query;

  const filter = {};

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

  if (campaignId) {
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      throw new ApiError({
        statusCode: 400,
        message: 'Invalid campaignId',
      });
    }
    filter.campaign = campaignId;
  }

  if (tag) {
    filter.tags = tag.toLowerCase().trim();
  }

  if (status && ['active', 'disabled'].includes(status)) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { shortCode: { $regex: search, $options: 'i' } },
      { destinationUrl: { $regex: search, $options: 'i' } },
    ];
  }

  const links = await Link.find(filter)
    .sort({ createdAt: -1 })
    .populate('workspace', 'name')
    .populate('campaign', 'name');

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Links retrieved',
      data: {
        links: links.map((l) => serializeLink(l, req)),
      },
    })
  );
});

const getLinkById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid link ID',
    });
  }

  const link = await Link.findById(id)
    .populate({
      path: 'workspace',
      select: 'name owner',
    })
    .populate('campaign', 'name');

  if (!link) {
    throw new ApiError({
      statusCode: 404,
      message: 'Link not found',
    });
  }

  const isOwner = link.workspace?.owner?.equals(req.user._id);
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
      message: 'Link retrieved',
      data: {
        link: serializeLink(link, req),
      },
    })
  );
});

const updateLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid link ID',
    });
  }

  const link = await Link.findById(id).populate({
    path: 'workspace',
    select: 'name owner',
  });

  if (!link) {
    throw new ApiError({
      statusCode: 404,
      message: 'Link not found',
    });
  }

  const isOwner = link.workspace?.owner?.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError({
      statusCode: 403,
      message: 'Insufficient permissions',
    });
  }

  const {
    destinationUrl,
    campaignId,
    tags,
    status,
    expiresAt,
    clickLimit,
    password,
  } = req.body;

  if (destinationUrl) {
    if (await isDomainBlocked(destinationUrl)) {
      throw new ApiError({
        statusCode: 400,
        message: 'Destination domain is blocked due to safety policies',
      });
    }
    link.destinationUrl = destinationUrl;
  }

  if (campaignId !== undefined) {
    if (campaignId === null || campaignId === '') {
      link.campaign = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        throw new ApiError({
          statusCode: 400,
          message: 'Invalid campaignId',
        });
      }

      const campaign = await Campaign.findById(campaignId);
      if (!campaign || !campaign.workspace.equals(link.workspace._id)) {
        throw new ApiError({
          statusCode: 400,
          message: 'Campaign does not belong to this workspace',
        });
      }
      link.campaign = campaign._id;
    }
  }

  if (tags !== undefined) {
    link.tags = tags;
  }

  if (status !== undefined) {
    link.status = status;
  }

  if (expiresAt !== undefined) {
    link.expiresAt = expiresAt ? new Date(expiresAt) : null;
  }

  if (clickLimit !== undefined) {
    link.clickLimit = clickLimit;
  }

  if (password !== undefined) {
    if (password === null || password === '') {
      link.passwordHash = null;
    } else {
      link.passwordHash = await bcrypt.hash(password, 12);
    }
  }

  await link.save();
  await link.populate('campaign', 'name');

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Link updated successfully',
      data: {
        link: serializeLink(link, req),
      },
    })
  );
});

const deleteLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid link ID',
    });
  }

  const link = await Link.findById(id).populate({
    path: 'workspace',
    select: 'name owner',
  });

  if (!link) {
    throw new ApiError({
      statusCode: 404,
      message: 'Link not found',
    });
  }

  const isOwner = link.workspace?.owner?.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError({
      statusCode: 403,
      message: 'Insufficient permissions',
    });
  }

  await ClickEvent.deleteMany({ link: link._id });
  await link.deleteOne();

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Link deleted successfully',
    })
  );
});

const getLinkQrCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { download, format } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid link ID',
    });
  }

  const link = await Link.findById(id).populate({
    path: 'workspace',
    select: 'name owner',
  });

  if (!link) {
    throw new ApiError({
      statusCode: 404,
      message: 'Link not found',
    });
  }

  const isOwner = link.workspace?.owner?.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError({
      statusCode: 403,
      message: 'Insufficient permissions',
    });
  }

  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || 'http';
  const qrTargetUrl = `${protocol}://${host}/r/${link.shortCode}?src=qr`;

  if (download === 'true' || format === 'png') {
    res.setHeader('Content-Type', 'image/png');
    if (download === 'true') {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${link.shortCode}-qr.png"`
      );
    }
    return qrcode.toFileStream(res, qrTargetUrl, { width: 400, margin: 2 });
  }

  const qrDataUrl = await qrcode.toDataURL(qrTargetUrl, {
    width: 400,
    margin: 2,
  });

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'QR code generated',
      data: {
        shortCode: link.shortCode,
        targetUrl: qrTargetUrl,
        qrCode: qrDataUrl,
      },
    })
  );
});

const getLinkAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { period = '7d' } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid link ID',
    });
  }

  const link = await Link.findById(id).populate({
    path: 'workspace',
    select: 'name owner',
  });

  if (!link) {
    throw new ApiError({
      statusCode: 404,
      message: 'Link not found',
    });
  }

  const isOwner = link.workspace?.owner?.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError({
      statusCode: 403,
      message: 'Insufficient permissions for this link',
    });
  }

  const analytics = await aggregateClickAnalytics({
    linkIds: link._id,
    period,
  });

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'Link analytics retrieved',
      data: {
        link: {
          id: link.id,
          shortCode: link.shortCode,
          shortUrl: serializeLink(link, req).shortUrl,
          destinationUrl: link.destinationUrl,
          totalClicksLifetime: link.totalClicks,
        },
        ...analytics,
      },
    })
  );
});

export {
  createLink,
  deleteLink,
  getLinkAnalytics,
  getLinkById,
  getLinkQrCode,
  listLinks,
  updateLink,
};
