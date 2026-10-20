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
import config from '../config/config.js';
import { createLinkSchema } from '../zod-schema/link_schemas.js';

const normalizeCsvHeader = (header) =>
  header.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s_-]/g, '');

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted && character === '"' && text[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      if (quoted) {
        quoted = false;
      } else if (field.length === 0) {
        quoted = true;
      } else {
        throw new ApiError({
          statusCode: 400,
          message: 'Wrap CSV values containing quotes in double quotes.',
        });
      }
    } else if (!quoted && character === ',') {
      row.push(field.trim());
      field = '';
    } else if (!quoted && (character === '\n' || character === '\r')) {
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
      if (character === '\r' && text[index + 1] === '\n') index += 1;
    } else {
      field += character;
    }
  }

  if (quoted) {
    throw new ApiError({
      statusCode: 400,
      message: 'This CSV has an unclosed quoted field.',
    });
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
};

const createLinkForWorkspace = async (workspace, details) => {
  const {
    campaignId,
    destinationUrl,
    customAlias,
    tags,
    expiresAt,
    clickLimit,
    password,
  } = details;

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

  const passwordHash = password ? await bcrypt.hash(password, 12) : null;
  return Link.create({
    workspace: workspace._id,
    campaign: campaignId || null,
    shortCode,
    destinationUrl,
    tags: tags || [],
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    clickLimit: clickLimit || null,
    passwordHash,
  });
};

const serializeLink = (link, req) => {
  const host = req?.get('host') || 'localhost:3000';
  const protocol = req?.protocol || 'http';
  const baseUrl = config.BASE_URL || `${protocol}://${host}`;

  return {
    id: link.id,
    shortCode: link.shortCode,
    shortUrl: `${baseUrl}/r/${link.shortCode}`,
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
  const { workspaceId } = req.body;

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

  const link = await createLinkForWorkspace(workspace, req.body);

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

const importLinks = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid workspaceId',
    });
  }

  if (typeof req.body !== 'string' || req.body.length === 0) {
    throw new ApiError({
      statusCode: 400,
      message: 'Upload a non-empty CSV file.',
    });
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new ApiError({
      statusCode: 404,
      message: 'Workspace not found',
    });
  }
  if (
    !workspace.owner.equals(req.user._id) &&
    req.user.role !== 'admin'
  ) {
    throw new ApiError({
      statusCode: 403,
      message: 'Insufficient permissions for this workspace',
    });
  }

  const rows = parseCsv(req.body);
  if (rows.length < 2) {
    throw new ApiError({
      statusCode: 400,
      message: 'Add a header row and at least one link to the CSV.',
    });
  }

  const headers = rows[0].map(normalizeCsvHeader);
  const urlIndex = headers.findIndex((header) =>
    ['destinationurl', 'url'].includes(header)
  );
  if (urlIndex < 0) {
    throw new ApiError({
      statusCode: 400,
      message: 'The CSV needs a destinationUrl (or url) column.',
    });
  }

  const aliasIndex = headers.indexOf('customalias');
  const tagsIndex = headers.indexOf('tags');
  const campaignIndex = headers.indexOf('campaign');
  const campaigns = await Campaign.find({ workspace: workspace._id });
  const aliases = new Set();
  const results = [];

  for (const [index, values] of rows.slice(1).entries()) {
    const rowNumber = index + 2;
    let details;
    let rowError = '';
    if (values.length !== headers.length) {
      rowError = 'This row has a different number of columns than the header.';
    } else {
      const campaignName = campaignIndex < 0 ? '' : values[campaignIndex];
      const campaign = campaignName
        ? campaigns.find(
            (item) => item.name.toLowerCase() === campaignName.toLowerCase()
          )
        : null;

      if (campaignName && !campaign) {
        rowError = `Campaign "${campaignName}" is not in this workspace.`;
      } else {
        details = {
          workspaceId,
          destinationUrl: values[urlIndex] || '',
          customAlias:
            aliasIndex < 0 || !values[aliasIndex] ? null : values[aliasIndex],
          campaignId: campaign?._id.toString() || null,
          tags:
            tagsIndex < 0 || !values[tagsIndex]
              ? []
              : values[tagsIndex]
                  .split('|')
                  .map((tag) => tag.trim())
                  .filter(Boolean),
        };
        const validation = await createLinkSchema.safeParseAsync(details);
        if (!validation.success) {
          rowError = validation.error.issues[0]?.message || 'Invalid link data.';
        } else {
          details = validation.data;
          const protocol = new URL(details.destinationUrl).protocol;
          if (!['http:', 'https:'].includes(protocol)) {
            rowError = 'Destination must use HTTP or HTTPS.';
          } else {
            const aliasKey = details.customAlias?.toLowerCase();
            if (aliasKey && aliases.has(aliasKey)) {
              rowError = 'This alias appears more than once in the file.';
            } else if (aliasKey) {
              aliases.add(aliasKey);
            }
          }
        }
      }
    }

    if (rowError) {
      results.push({ rowNumber, error: rowError });
      continue;
    }

    try {
      const link = await createLinkForWorkspace(workspace, details);
      results.push({ rowNumber, link: serializeLink(link, req) });
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      results.push({ rowNumber, error: error.message });
    }
  }

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      message: 'CSV import processed',
      data: { results },
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
  const baseUrl = config.BASE_URL || `${protocol}://${host}`;
  const qrTargetUrl = `${baseUrl}/r/${link.shortCode}?src=qr`;

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
  importLinks,
  listLinks,
  updateLink,
};
