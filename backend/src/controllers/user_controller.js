import { asyncHandler } from '../utils/async_handler.js';
import { User } from '../models/user_model.js';
import { ApiResponse } from '../utils/api_reponse.js';
import { sendResponse } from '../utils/send_reponse.js';

const signUp = asyncHandler(async (req, res) => {
  const data = req.data || req.body;
  const { email, password } = data;

  return sendResponse(
    res,
    new ApiResponse({
      statusCode: 200,
      data: { email },
      message: 'User registered successfully',
    })
  );
});

export { signUp };
