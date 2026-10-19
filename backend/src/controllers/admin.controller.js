import { User } from '../models/user.model.js';
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

export { listUsers };
