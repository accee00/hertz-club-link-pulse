import { Campaign } from '../models/campaign.model.js';
import { User } from '../models/user.model.js';
import { Workspace } from '../models/workspace.model.js';
import { ApiResponse } from '../utils/api_reponse.js';

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('name email role createdAt');

    return res.status(200).json(
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
  } catch (error) {
    return next(error);
  }
};

const listAllWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find()
      .sort({ createdAt: -1 })
      .populate('owner', 'name email role');

    return res.status(200).json(
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
  } catch (error) {
    return next(error);
  }
};

const listAllCampaigns = async (req, res, next) => {
  try {
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

    return res.status(200).json(
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
  } catch (error) {
    return next(error);
  }
};

export { listAllCampaigns, listAllWorkspaces, listUsers };
